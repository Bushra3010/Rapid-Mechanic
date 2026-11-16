import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, DEFAULT_LOCATION, Divider, Header, Loading, MapPicker, PaymentSheet, Row, Screen, Section, TextField, type MapValue } from '@/components';
import { useQuery } from '@/hooks/useQuery';
import { cartService, orderService, profileService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import type { GatewayResult } from '@/types';
import { formatINR } from '@/utils/format';
import { resetToTracking } from '@/utils/nav';

export default function Checkout() {
  const { data: cart } = useQuery(() => cartService.getCart());
  const { data: profile } = useQuery(() => profileService.getMyProfile());
  const [loc, setLoc] = useState<MapValue>(DEFAULT_LOCATION);
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  // snapshot the total so the sheet keeps showing it after the cart is cleared on success
  const [payAmount, setPayAmount] = useState(0);

  if (!cart) return <Loading />;

  const pay = () => {
    if (loc.address.trim().length < 8) return setError('Enter your delivery address');
    if (!/^[1-9]\d{5}$/.test(pincode)) return setError('Enter a valid 6-digit pincode');
    setError('');
    setPayAmount(cart.total);
    setPayOpen(true);
  };

  const onPaid = async (gw: GatewayResult) => {
    const shipping = `${profile?.full_name ? `${profile.full_name}, ` : ''}${loc.address.trim()} - ${pincode}`;
    const order = await orderService.placeOrder(shipping, gw);
    return order.id;
  };

  return (
    <Screen
      header={<Header back title="Checkout" />}
      footer={
        <View style={{ gap: spacing.sm }}>
          {error ? <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text> : null}
          <Button title={`Pay ${formatINR(cart.total)}`} variant="accent" size="lg" onPress={pay} disabled={cart.items.length === 0} />
        </View>
      }>
      <Section title="Delivery address">
        <Card style={{ gap: spacing.md }}>
          <MapPicker value={loc} onChange={setLoc} height={140} addressLabel="Address" />
          <TextField label="Pincode" keyboardType="number-pad" maxLength={6} value={pincode} onChangeText={(t) => setPincode(t.replace(/\D/g, ''))} placeholder="e.g. 411045" />
        </Card>
      </Section>
      <Section title="Order summary">
        <Card>
          {cart.items.map((i) => (
            <Row key={i.product.id} label={`${i.qty} × ${i.product.name}`} value={formatINR(i.product.price * i.qty)} />
          ))}
          <Divider />
          <Row label="Delivery" value={cart.shipping ? formatINR(cart.shipping) : 'FREE'} />
          <Row label="Total" value={formatINR(cart.total)} strong />
          <Text style={[typography.small, { marginTop: spacing.sm }]}>
            Items from different sellers may arrive in separate packages.
          </Text>
        </Card>
      </Section>

      <PaymentSheet
        visible={payOpen}
        amount={payAmount}
        title={`Order · ${cart.count || ''} item${cart.count === 1 ? '' : 's'}`}
        onClose={() => setPayOpen(false)}
        onPaid={onPaid}
        successLabel="Order placed!"
        onSuccess={(id) => {
          setPayOpen(false);
          if (id) resetToTracking(`/track/order/${id}`);
        }}
      />
    </Screen>
  );
}
