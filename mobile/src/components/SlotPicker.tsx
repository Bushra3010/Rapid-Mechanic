import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { dayLabel } from '@/utils/format';
import { Chip } from './Chip';

export const TIME_SLOTS = [
  { label: '9 – 11 AM', hour: 9 },
  { label: '11 AM – 1 PM', hour: 11 },
  { label: '2 – 4 PM', hour: 14 },
  { label: '4 – 6 PM', hour: 16 },
  { label: '6 – 8 PM', hour: 18 },
];

interface Props {
  dayOffset: number | null;
  hour: number | null;
  onChange: (v: { dayOffset: number; hour: number | null }) => void;
}

export function slotToIso(dayOffset: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function SlotPicker({ dayOffset, hour, onChange }: Props) {
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return { offset: i, ...dayLabel(d), top: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayLabel(d).top };
      }),
    [],
  );
  const nowHour = new Date().getHours();
  return (
    <View style={{ gap: spacing.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {days.map((d) => {
          const sel = d.offset === dayOffset;
          return (
            <Pressable key={d.offset} onPress={() => onChange({ dayOffset: d.offset, hour: null })} style={[styles.day, sel && styles.daySel]}>
              <Text style={[styles.dayTop, sel && styles.selText]}>{d.top}</Text>
              <Text style={[styles.dayBottom, sel && styles.selText]}>{d.bottom}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {dayOffset !== null ? (
        <View style={styles.slots}>
          {TIME_SLOTS.map((s) => {
            const past = dayOffset === 0 && s.hour <= nowHour;
            return past ? null : (
              <Chip key={s.hour} label={s.label} selected={hour === s.hour} onPress={() => onChange({ dayOffset, hour: s.hour })} />
            );
          })}
          {dayOffset === 0 && TIME_SLOTS.every((s) => s.hour <= nowHour) ? (
            <Text style={{ color: colors.textMuted }}>No slots left today — pick another day.</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    width: 64,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  daySel: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayTop: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  dayBottom: { fontSize: 14, color: colors.text, fontWeight: '700', marginTop: 2 },
  selText: { color: colors.white },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
