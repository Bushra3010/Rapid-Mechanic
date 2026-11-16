import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

export function QtyStepper({ value, onChange, max = 99 }: { value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityLabel="Decrease quantity" style={styles.btn} onPress={() => onChange(value - 1)}>
        <Ionicons name={value <= 1 ? 'trash-outline' : 'remove'} size={16} color={colors.primary} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable accessibilityLabel="Increase quantity" style={styles.btn} disabled={value >= max} onPress={() => onChange(value + 1)}>
        <Ionicons name="add" size={16} color={value >= max ? colors.textFaint : colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill },
  btn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 22, textAlign: 'center', fontWeight: '700', color: colors.text },
});
