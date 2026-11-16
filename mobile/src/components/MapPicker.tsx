// Placeholder map until the Google Maps key is provided.
// TODO(google-maps): replace the styled box with react-native-maps (PROVIDER_GOOGLE)
// or the Google Maps JS SDK on web; keep the same `value` / `onChange` contract.
// Add the key to app.json -> ios.config.googleMapsApiKey / android.config.googleMaps.apiKey,
// and use the Places Autocomplete + Geocoding APIs for the address field.
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View, type LayoutChangeEvent } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export interface MapValue {
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  value: MapValue;
  onChange: (v: MapValue) => void;
  height?: number;
  addressLabel?: string;
}

// Default: Pune city centre
export const DEFAULT_LOCATION: MapValue = { address: '', lat: 18.5204, lng: 73.8567 };

const DEG_PER_PX = 0.00004; // fake map scale

export function MapPicker({ value, onChange, height = 190, addressLabel = 'Full address' }: Props) {
  const [size, setSize] = useState({ w: 0, h: height });
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const mapRef = useRef<ComponentRef<typeof View>>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setSize({ w: width, h });
  };

  const pinPos = pin ?? { x: size.w / 2, y: size.h / 2 };

  const moveTo = (x: number, y: number, w: number, h: number) => {
    if (![x, y, w, h].every(Number.isFinite) || w <= 0) return;
    x = Math.min(Math.max(x, 0), w);
    y = Math.min(Math.max(y, 36), h);
    setPin({ x, y });
    const dx = x - w / 2;
    const dy = y - h / 2;
    onChange({
      ...value,
      lat: +(DEFAULT_LOCATION.lat - dy * DEG_PER_PX).toFixed(6),
      lng: +(DEFAULT_LOCATION.lng + dx * DEG_PER_PX).toFixed(6),
    });
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    setHint(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('denied');
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({}),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
      let address = value.address;
      if (Platform.OS !== 'web') {
        try {
          const [g] = await Location.reverseGeocodeAsync(pos.coords);
          if (g) address = [g.name, g.street, g.district, g.city, g.postalCode].filter(Boolean).join(', ');
        } catch {
          /* geocoding is best-effort */
        }
      }
      setPin(null);
      onChange({ address: address || value.address, lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) });
      setHint('Location detected');
    } catch {
      // Stub fallback so the flow is always demoable (simulators / web without permission).
      setPin(null);
      onChange({
        address: value.address || 'Flat 302, Sai Residency, Baner Road, Pune 411045',
        lat: 18.559,
        lng: 73.7868,
      });
      setHint('Using demo location (location unavailable)');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Pressable
        onLayout={onLayout}
        ref={mapRef}
        onPress={(e) => {
          const { locationX, locationY, pageX, pageY } = e.nativeEvent;
          if (Platform.OS !== 'web' && Number.isFinite(locationX)) return moveTo(locationX, locationY, size.w, size.h);
          // react-native-web doesn't reliably provide locationX/Y — derive from the page position
          mapRef.current?.measureInWindow((mx: number, my: number, mw: number, mh: number) =>
            moveTo(pageX - mx, pageY - my, mw, mh),
          );
        }}
        style={[styles.map, { height }]}
        accessibilityLabel="Map. Tap to move the pin">
        {/* fake roads */}
        <View style={[styles.road, { top: '30%', left: 0, right: 0, height: 10 }]} />
        <View style={[styles.road, { top: '72%', left: 0, right: 0, height: 6 }]} />
        <View style={[styles.road, { left: '22%', top: 0, bottom: 0, width: 8 }]} />
        <View style={[styles.road, { left: '64%', top: 0, bottom: 0, width: 12 }]} />
        <View style={[styles.block, { top: '8%', left: '30%', width: '28%', height: '16%' }]} />
        <View style={[styles.block, { top: '40%', left: '70%', width: '24%', height: '26%' }]} />
        <View style={[styles.park, { top: '40%', left: '4%', width: '14%', height: '26%' }]} />
        {size.w > 0 ? (
          <View pointerEvents="none" style={[styles.pinWrap, { left: pinPos.x - 18, top: pinPos.y - 40 }]}>
            <Ionicons name="location" size={36} color={colors.accent} />
            <View style={styles.pinShadow} />
          </View>
        ) : null}
        <View style={styles.mapTag} pointerEvents="none">
          <Text style={styles.mapTagText}>
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </Text>
        </View>
        <View style={styles.mapHint} pointerEvents="none">
          <Ionicons name="hand-left-outline" size={12} color={colors.textMuted} />
          <Text style={styles.mapHintText}>Tap map to move pin</Text>
        </View>
      </Pressable>

      <Pressable onPress={useCurrentLocation} style={styles.locBtn} disabled={locating}>
        {locating ? <ActivityIndicator size="small" color={colors.accent} /> : <Ionicons name="locate" size={18} color={colors.accent} />}
        <Text style={styles.locText}>Use current location</Text>
      </Pressable>
      {hint ? <Text style={typography.small}>{hint}</Text> : null}

      <View style={{ gap: 6 }}>
        <Text style={styles.label}>{addressLabel}</Text>
        <TextInput
          value={value.address}
          onChangeText={(address) => onChange({ ...value, address })}
          placeholder="House / flat no., street, area, city, pincode"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    borderRadius: radius.lg,
    backgroundColor: '#E9EEF2',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  road: { position: 'absolute', backgroundColor: '#FFFFFF' },
  block: { position: 'absolute', backgroundColor: '#DCE3EA', borderRadius: 6 },
  park: { position: 'absolute', backgroundColor: '#D5EBD9', borderRadius: 6 },
  pinWrap: { position: 'absolute', alignItems: 'center', width: 36 },
  pinShadow: { width: 12, height: 4, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.2)', marginTop: -3 },
  mapTag: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mapTagText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  mapHint: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mapHintText: { fontSize: 11, color: colors.textMuted },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    alignSelf: 'flex-start',
  },
  locText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  input: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
});
