import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { StatusHistoryEntry } from '@/types';
import { formatDateTime } from '@/utils/format';

interface Props<S extends string> {
  /** Ordered happy-path steps, e.g. JOB_FLOW. */
  steps: S[];
  labels: Record<S, string>;
  status: S;
  history: StatusHistoryEntry<S>[];
  /** Status value that means the flow was aborted. */
  cancelledStatus?: S;
}

export function Timeline<S extends string>({ steps, labels, status, history, cancelledStatus }: Props<S>) {
  const cancelled = cancelledStatus !== undefined && status === cancelledStatus;
  const reachedIndex = cancelled
    ? Math.max(-1, ...history.map((h) => steps.indexOf(h.status)))
    : steps.indexOf(status);
  const rows: { key: string; label: string; entry?: StatusHistoryEntry<S>; state: 'done' | 'current' | 'todo' | 'cancelled' }[] =
    steps.map((s, i) => ({
      key: s,
      label: labels[s],
      entry: [...history].reverse().find((h) => h.status === s),
      state: i < reachedIndex ? 'done' : i === reachedIndex ? (cancelled ? 'done' : 'current') : 'todo',
    }));
  if (cancelled) {
    const entry = [...history].reverse().find((h) => h.status === cancelledStatus);
    rows.splice(reachedIndex + 1, rows.length, { key: 'cancelled', label: labels[cancelledStatus!], entry, state: 'cancelled' });
  }
  // the final step counts as done, not "in progress"
  const last = rows[rows.length - 1];
  if (last.state === 'current' && last.key === steps[steps.length - 1]) last.state = 'done';

  return (
    <View>
      {rows.map((r, i) => {
        const isLast = i === rows.length - 1;
        const dotColor =
          r.state === 'cancelled' ? colors.danger : r.state === 'todo' ? colors.border : r.state === 'current' ? colors.accent : colors.success;
        const lineColor = rows[i + 1] && rows[i + 1].state !== 'todo' ? colors.success : colors.border;
        return (
          <View key={r.key} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: r.state === 'todo' ? colors.surface : dotColor, borderColor: dotColor }]}>
                {r.state === 'done' ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                {r.state === 'cancelled' ? <Ionicons name="close" size={14} color={colors.white} /> : null}
                {r.state === 'current' ? <View style={styles.pulse} /> : null}
              </View>
              {!isLast ? <View style={[styles.line, { backgroundColor: lineColor }]} /> : null}
            </View>
            <View style={[styles.body, isLast && { paddingBottom: 0 }]}>
              <Text style={[typography.bodyStrong, r.state === 'todo' && { color: colors.textFaint }]}>{r.label}</Text>
              {r.entry ? (
                <>
                  <Text style={typography.small}>{formatDateTime(r.entry.at)}</Text>
                  {r.entry.note ? <Text style={[typography.small, { color: colors.text }]}>{r.entry.note}</Text> : null}
                </>
              ) : (
                <Text style={[typography.small, { color: colors.textFaint }]}>Pending</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 26 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
  line: { flex: 1, width: 2, marginVertical: 2, minHeight: 24 },
  body: { flex: 1, paddingBottom: spacing.xl, gap: 2 },
});
