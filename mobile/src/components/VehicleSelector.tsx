import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Vehicle, VehicleType } from '@/types';
import { fuelLabel } from '@/utils/format';

export function vehicleIcon(type: VehicleType): keyof typeof Ionicons.glyphMap {
  return type === 'two_wheeler' ? 'bicycle' : 'car-sport';
}

export function vehicleName(v: Pick<Vehicle, 'make' | 'model'>) {
  return `${v.make} ${v.model}`;
}

interface Props {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Restricts "Add vehicle" form to a type. */
  type?: VehicleType;
}

export function VehicleSelector({ vehicles, selectedId, onSelect, type }: Props) {
  return (
    <View style={{ gap: spacing.sm }}>
      {vehicles.map((v) => {
        const sel = v.id === selectedId;
        return (
          <Pressable key={v.id} onPress={() => onSelect(v.id)} style={[styles.item, sel && styles.itemSel]}>
            <View style={styles.icon}>
              <Ionicons name={vehicleIcon(v.type)} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.bodyStrong}>{vehicleName(v)}</Text>
              <Text style={typography.small}>
                {v.reg_number} · {v.year} · {fuelLabel[v.fuel]}
              </Text>
            </View>
            <Ionicons name={sel ? 'radio-button-on' : 'radio-button-off'} size={22} color={sel ? colors.accent : colors.textFaint} />
          </Pressable>
        );
      })}
      <Pressable
        style={styles.add}
        onPress={() => router.push({ pathname: '/vehicles/edit', params: type ? { type } : {} })}>
        <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
        <Text style={styles.addText}>Add a {type === 'four_wheeler' ? 'car' : type === 'two_wheeler' ? 'two-wheeler' : 'vehicle'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemSel: { borderColor: colors.accent, borderWidth: 2, backgroundColor: '#FFFBF8' },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  addText: { color: colors.accent, fontWeight: '700' },
});
