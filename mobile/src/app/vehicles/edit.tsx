// Add / edit vehicle. `?type=` preselects the vehicle type, `?id=` edits.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, Header, Screen, TextField } from '@/components';
import { VEHICLE_MAKES } from '@/data/seed';
import { vehicleService } from '@/services';
import { colors, spacing } from '@/theme';
import type { Fuel, VehicleType } from '@/types';
import { fuelLabel } from '@/utils/format';

const FUELS: Fuel[] = ['petrol', 'diesel', 'cng', 'electric'];

export default function EditVehicle() {
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const lockedType = params.type === 'two_wheeler' || params.type === 'four_wheeler' ? (params.type as VehicleType) : null;
  const [type, setType] = useState<VehicleType>(lockedType ?? 'two_wheeler');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [reg, setReg] = useState('');
  const [fuel, setFuel] = useState<Fuel>('petrol');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    vehicleService.getVehicle(params.id).then((v) => {
      if (!v) return;
      setType(v.type);
      setMake(v.make);
      setModel(v.model);
      setYear(String(v.year));
      setReg(v.reg_number);
      setFuel(v.fuel);
    });
  }, [params.id]);

  const save = async () => {
    const y = Number(year);
    if (!make.trim() || !model.trim()) return setError('Enter make and model');
    if (!(y >= 1980 && y <= new Date().getFullYear() + 1)) return setError('Enter a valid year');
    if (!/^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{0,3}\s?\d{1,4}$/i.test(reg.trim())) return setError('Enter a valid registration number, e.g. MH 12 AB 1234');
    setSaving(true);
    try {
      await vehicleService.saveVehicle({ type, make: make.trim(), model: model.trim(), year: y, reg_number: reg.trim(), fuel }, params.id);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      header={<Header back title={params.id ? 'Edit vehicle' : 'Add vehicle'} />}
      footer={
        <View style={{ gap: spacing.sm }}>
          {error ? <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text> : null}
          <Button title="Save vehicle" onPress={save} loading={saving} />
        </View>
      }>
      <Text style={styles.label}>Vehicle type</Text>
      <View style={styles.row}>
        <Chip icon="bicycle" label="Two-wheeler" selected={type === 'two_wheeler'} onPress={() => !lockedType && setType('two_wheeler')} />
        <Chip icon="car-sport" label="Four-wheeler" selected={type === 'four_wheeler'} onPress={() => !lockedType && setType('four_wheeler')} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <TextField label="Make" value={make} onChangeText={setMake} placeholder={type === 'two_wheeler' ? 'e.g. Honda' : 'e.g. Hyundai'} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {VEHICLE_MAKES[type].map((m) => (
            <Chip key={m} label={m} selected={make === m} onPress={() => setMake(m)} />
          ))}
        </ScrollView>
      </View>
      <TextField label="Model" value={model} onChangeText={setModel} placeholder={type === 'two_wheeler' ? 'e.g. Activa 6G' : 'e.g. Creta SX'} />
      <TextField label="Year" value={year} onChangeText={(t) => setYear(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={4} />
      <TextField label="Registration number" value={reg} onChangeText={(t) => setReg(t.toUpperCase())} placeholder="MH 12 AB 1234" autoCapitalize="characters" />
      <Text style={styles.label}>Fuel</Text>
      <View style={styles.row}>
        {FUELS.map((f) => (
          <Chip key={f} label={fuelLabel[f]} selected={fuel === f} onPress={() => setFuel(f)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: -spacing.sm },
});
