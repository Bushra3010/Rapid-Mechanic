import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, HeaderIconButton, Screen, SectionTitle, StatusBadge } from '@/components';
import { useCartCount, useQuery } from '@/hooks/useQuery';
import { orderService, profileService, requestService } from '@/services';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { formatDateTime, formatINR, shortId } from '@/utils/format';

type IconName = keyof typeof Ionicons.glyphMap;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const cartCount = useCartCount();
  const { data: profile } = useQuery(() => profileService.getMyProfile());
  const { data: requests } = useQuery(() => requestService.listMyRequests());
  const { data: orders } = useQuery(() => orderService.listMyOrders());

  const activeJob = requests?.find((r) => r.status !== 'completed' && r.status !== 'cancelled');
  const activeOrder = orders?.find((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const firstName = profile?.full_name?.split(' ')[0];

  const tiles: { title: string; sub: string; icon: IconName; onPress: () => void }[] = [
    { title: 'Two-wheeler', sub: 'Service & repair', icon: 'bicycle', onPress: () => router.push('/book/two_wheeler') },
    { title: 'Four-wheeler', sub: 'Service & repair', icon: 'car-sport', onPress: () => router.push('/book/four_wheeler') },
    { title: 'Yearly AMC', sub: 'Save up to 30%', icon: 'shield-checkmark', onPress: () => router.push('/amc') },
    { title: 'Products', sub: 'Parts & accessories', icon: 'storefront', onPress: () => router.push('/(tabs)/products') },
  ];

  return (
    <Screen padded={false} contentStyle={{ gap: 0 }}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>{greeting()}{firstName ? `, ${firstName}` : ''} 👋</Text>
            <View style={styles.locRow}>
              <Ionicons name="location" size={13} color={colors.accentLight} />
              <Text style={styles.loc}>Pune, Maharashtra</Text>
            </View>
          </View>
          <View style={styles.cartBtn}>
            <HeaderIconButton icon="cart-outline" label="Cart" badge={cartCount} onPress={() => router.push('/cart')} />
          </View>
        </View>
        <Text style={styles.heroTitle}>What does your vehicle need today?</Text>
      </View>

      <View style={styles.body}>
        <Pressable onPress={() => router.push('/rsa')} style={({ pressed }) => [styles.rsa, pressed && { opacity: 0.92 }]}>
          <View style={styles.rsaIcon}>
            <Ionicons name="warning" size={28} color={colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rsaTitle}>Roadside Assistance</Text>
            <Text style={styles.rsaSub}>Breakdown? Flat tyre? Get help in ~30 mins, 24×7</Text>
          </View>
          <View style={styles.sos}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </Pressable>

        <View style={styles.grid}>
          {tiles.map((t) => (
            <Pressable key={t.title} onPress={t.onPress} style={({ pressed }) => [styles.tile, pressed && { opacity: 0.9 }]}>
              <View style={styles.tileIcon}>
                <Ionicons name={t.icon} size={26} color={colors.primary} />
              </View>
              <Text style={typography.bodyStrong}>{t.title}</Text>
              <Text style={typography.small}>{t.sub}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => router.push('/amc')} style={styles.banner}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.bannerTag}>LIMITED OFFER</Text>
            <Text style={styles.bannerTitle}>Car Care Plus AMC</Text>
            <Text style={styles.bannerSub}>3 services + AC care + roadside help for {formatINR(9999)}/year</Text>
            <View style={styles.bannerCta}>
              <Text style={styles.bannerCtaText}>View plans</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.white} />
            </View>
          </View>
          <Ionicons name="shield-checkmark" size={78} color="rgba(255,255,255,0.18)" />
        </Pressable>

        {activeJob || activeOrder ? <SectionTitle title="In progress" /> : null}
        {activeJob ? (
          <Card onPress={() => router.push(`/track/request/${activeJob.id}`)}>
            <View style={styles.activeRow}>
              <View style={[styles.activeIcon, activeJob.kind === 'rsa' && { backgroundColor: colors.dangerSoft }]}>
                <Ionicons name={activeJob.kind === 'rsa' ? 'warning' : 'construct'} size={20} color={activeJob.kind === 'rsa' ? colors.danger : colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={typography.bodyStrong} numberOfLines={1}>{activeJob.title}</Text>
                <Text style={typography.small}>
                  {activeJob.vehicle ? `${activeJob.vehicle.make} ${activeJob.vehicle.model} · ` : ''}
                  {formatDateTime(activeJob.scheduled_at)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </View>
            <View style={styles.activeFoot}>
              <StatusBadge status={activeJob.status} />
              <Text style={styles.track}>Track</Text>
            </View>
          </Card>
        ) : null}
        {activeOrder ? (
          <Card onPress={() => router.push(`/track/order/${activeOrder.id}`)}>
            <View style={styles.activeRow}>
              <View style={styles.activeIcon}>
                <Ionicons name="cube" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={typography.bodyStrong}>Order {shortId(activeOrder.id)}</Text>
                <Text style={typography.small} numberOfLines={1}>
                  {activeOrder.items.length} item{activeOrder.items.length > 1 ? 's' : ''} · {formatINR(activeOrder.amount)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </View>
            <View style={styles.activeFoot}>
              <StatusBadge status={activeOrder.status} />
              <Text style={styles.track}>Track</Text>
            </View>
          </Card>
        ) : null}

        <View style={styles.trust}>
          {[
            { icon: 'shield-checkmark-outline' as IconName, label: 'Verified\nmechanics' },
            { icon: 'pricetag-outline' as IconName, label: 'Upfront\npricing' },
            { icon: 'time-outline' as IconName, label: '30-day\nwarranty' },
          ].map((t) => (
            <View key={t.label} style={styles.trustItem}>
              <Ionicons name={t.icon} size={22} color={colors.accent} />
              <Text style={styles.trustText}>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl + spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: spacing.lg,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.white },
  hello: { color: colors.white, fontSize: 17, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  loc: { color: '#C9D6E3', fontSize: 13 },
  cartBtn: { backgroundColor: colors.white, borderRadius: radius.pill, padding: 2 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  body: { padding: spacing.lg, gap: spacing.lg, marginTop: -spacing.xxxl },
  rsa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    ...shadow,
  },
  rsaIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  rsaTitle: { color: colors.white, fontSize: 17, fontWeight: '800' },
  rsaSub: { color: '#FFE6D6', fontSize: 13, marginTop: 2 },
  sos: { backgroundColor: colors.danger, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: colors.white },
  sosText: { color: colors.white, fontWeight: '900', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  tileIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
    borderLeftWidth: 6,
    borderLeftColor: colors.accentLight,
  },
  bannerTag: { color: colors.accentLight, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { color: colors.white, fontSize: 19, fontWeight: '800' },
  bannerSub: { color: '#C9D6E3', fontSize: 13 },
  bannerCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, backgroundColor: colors.accent, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  bannerCtaText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  activeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  activeFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  track: { color: colors.accent, fontWeight: '700' },
  trust: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.md },
  trustItem: { alignItems: 'center', gap: 6 },
  trustText: { fontSize: 12, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
});
