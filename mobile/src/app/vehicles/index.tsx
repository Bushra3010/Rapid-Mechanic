import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Header, Loading, Screen, vehicleIcon, vehicleName } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { vehicleService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import type { Vehicle } from '@/types';
import { fuelLabel, vehicleTypeLabel } from '@/utils/format';

export default function MyVehicles() {
  const { data, loading } = useQuery(() => vehicleService.listMyVehicles());

  const remove = (v: Vehicle) => {
    const doIt = () => vehicleService.deleteVehicle(v.id);
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${vehicleName(v)}?`)) doIt();
    } else {
      Alert.alert('Delete vehicle?', `${vehicleName(v)} (${v.reg_number}) will be removed.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doIt },
      ]);
    }
  };

  return (
    <Screen
      header={<Header back title="My vehicles" />}
      footer={<Button title="Add vehicle" icon="add" onPress={() => router.push('/vehicles/edit')} />}>
      {loading && !data ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState icon="car-sport-outline" title="No vehicles yet" message="Add your bike, scooter or car to book services faster." />
      ) : (
        data.map((v) => (
          <Card key={v.id} style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name={vehicleIcon(v.type)} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={typography.bodyStrong}>{vehicleName(v)}</Text>
              <Text style={typography.small}>
                {v.reg_number} · {v.year} · {fuelLabel[v.fuel]}
              </Text>
              <Text style={[typography.small, { color: colors.accent }]}>{vehicleTypeLabel[v.type]}</Text>
            </View>
            <Pressable accessibilityLabel="Edit vehicle" hitSlop={8} onPress={() => router.push({ pathname: '/vehicles/edit', params: { id: v.id } })}>
              <Ionicons name="create-outline" size={21} color={colors.primary} />
            </Pressable>
            <Pressable accessibilityLabel="Delete vehicle" hitSlop={8} onPress={() => remove(v)}>
              <Ionicons name="trash-outline" size={21} color={colors.danger} />
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
