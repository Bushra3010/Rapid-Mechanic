import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';
import { formatINR } from '@/utils/format';

interface Props {
  amount: number;
  mrp?: number;
  size?: 'sm' | 'md' | 'lg';
  suffix?: string;
  color?: string;
}

export function PriceText({ amount, mrp, size = 'md', suffix, color = colors.text }: Props) {
  const fs = size === 'sm' ? 14 : size === 'lg' ? 24 : 17;
  const off = mrp && mrp > amount ? Math.round(((mrp - amount) / mrp) * 100) : 0;
  return (
    <View style={styles.row}>
      <Text style={[styles.price, { fontSize: fs, color }]}>
        {formatINR(amount)}
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </Text>
      {off > 0 ? (
        <>
          <Text style={[styles.mrp, { fontSize: fs - 3 }]}>{formatINR(mrp!)}</Text>
          <Text style={[styles.off, { fontSize: fs - 4 }]}>{off}% off</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  price: { fontWeight: '800' },
  suffix: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  mrp: { color: colors.textFaint, textDecorationLine: 'line-through' },
  off: { color: colors.success, fontWeight: '700' },
});
