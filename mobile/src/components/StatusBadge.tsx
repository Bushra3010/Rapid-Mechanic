import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';
import type { AmcStatus, JobStatus, OrderStatus } from '@/types';
import { jobStatusLabel, orderStatusLabel } from '@/utils/format';

type Status = JobStatus | OrderStatus | AmcStatus;

const tone: Record<Status, { bg: string; fg: string }> = {
  submitted: { bg: colors.infoSoft, fg: colors.info },
  assigned: { bg: colors.warningSoft, fg: colors.warning },
  in_progress: { bg: colors.accentSoft, fg: colors.accent },
  completed: { bg: colors.successSoft, fg: colors.success },
  cancelled: { bg: colors.dangerSoft, fg: colors.danger },
  placed: { bg: colors.infoSoft, fg: colors.info },
  dispatched: { bg: colors.warningSoft, fg: colors.warning },
  in_transit: { bg: colors.accentSoft, fg: colors.accent },
  delivered: { bg: colors.successSoft, fg: colors.success },
  active: { bg: colors.successSoft, fg: colors.success },
  expired: { bg: colors.primarySoft, fg: colors.textMuted },
};

function label(status: Status) {
  if (status in jobStatusLabel) return jobStatusLabel[status as JobStatus];
  if (status in orderStatusLabel) return orderStatusLabel[status as OrderStatus];
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function StatusBadge({ status }: { status: Status }) {
  const t = tone[status];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <View style={[styles.dot, { backgroundColor: t.fg }]} />
      <Text style={[styles.text, { color: t.fg }]}>{label(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '700' },
});
