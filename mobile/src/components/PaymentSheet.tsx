// Mock payment sheet. TODO(payment-gateway): swap paymentService.chargeMock for the real
// gateway checkout (Razorpay / Cashfree / PhonePe). Keep the onPaid(GatewayResult) contract.
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { paymentService } from '@/services';
import type { PaymentMethod } from '@/services/payments';
import { colors, radius, spacing, typography } from '@/theme';
import type { GatewayResult } from '@/types';
import { formatINR } from '@/utils/format';
import { Button } from './Button';

interface Props {
  visible: boolean;
  amount: number;
  title: string;
  onClose: () => void;
  /** Called after the (mock) gateway succeeds — create the entity here. */
  onPaid: (result: GatewayResult) => Promise<string | void>;
  successLabel?: string;
  /** Called ~1.3s after the success state is shown (navigate away here). */
  onSuccess?: (createdId: string | undefined) => void;
}

const METHODS: { key: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap; sub: string }[] = [
  { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline', sub: 'GPay, PhonePe, Paytm, BHIM' },
  { key: 'card', label: 'Credit / Debit card', icon: 'card-outline', sub: 'Visa, Mastercard, RuPay' },
  { key: 'netbanking', label: 'Net banking', icon: 'business-outline', sub: 'All major Indian banks' },
];

export function PaymentSheet({ visible, amount, title, onClose, onPaid, successLabel = 'Payment successful', onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [stage, setStage] = useState<'select' | 'processing' | 'success' | 'error'>('select');
  const [error, setError] = useState('');

  const pay = async () => {
    setStage('processing');
    try {
      const result = await paymentService.chargeMock(amount, method);
      const createdId = (await onPaid(result)) || undefined;
      setStage('success');
      setTimeout(() => {
        setStage('select');
        onSuccess?.(createdId);
      }, 1300);
    } catch (e) {
      setError((e as Error).message);
      setStage('error');
    }
  };

  const close = () => {
    if (stage === 'processing') return;
    setStage('select');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={stage === 'select' ? close : undefined} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />
        {stage === 'success' ? (
          <View style={styles.center}>
            <View style={[styles.bigIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
            </View>
            <Text style={typography.h2}>{successLabel}</Text>
            <Text style={typography.small}>{formatINR(amount)} paid · {title}</Text>
          </View>
        ) : stage === 'error' ? (
          <View style={styles.center}>
            <View style={[styles.bigIcon, { backgroundColor: colors.dangerSoft }]}>
              <Ionicons name="close-circle" size={56} color={colors.danger} />
            </View>
            <Text style={typography.h2}>Payment failed</Text>
            <Text style={typography.small}>{error}</Text>
            <Button title="Try again" onPress={() => setStage('select')} />
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={typography.caption}>PAYING FOR</Text>
                <Text style={typography.h3} numberOfLines={1}>
                  {title}
                </Text>
              </View>
              <Text style={styles.amount}>{formatINR(amount)}</Text>
            </View>
            {METHODS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMethod(m.key)}
                disabled={stage === 'processing'}
                style={[styles.method, method === m.key && styles.methodSelected]}>
                <Ionicons name={m.icon} size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyStrong}>{m.label}</Text>
                  <Text style={typography.small}>{m.sub}</Text>
                </View>
                <Ionicons
                  name={method === m.key ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={method === m.key ? colors.accent : colors.textFaint}
                />
              </Pressable>
            ))}
            <View style={styles.secure}>
              <Ionicons name="lock-closed" size={13} color={colors.textMuted} />
              <Text style={typography.small}>Test mode · no real money is charged</Text>
            </View>
            <Button title={`Pay ${formatINR(amount)}`} variant="accent" size="lg" loading={stage === 'processing'} onPress={pay} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  amount: { fontSize: 24, fontWeight: '800', color: colors.primary },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodSelected: { borderColor: colors.accent, backgroundColor: '#FFFBF8' },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  bigIcon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
});
