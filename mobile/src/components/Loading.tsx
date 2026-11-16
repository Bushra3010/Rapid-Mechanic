import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/theme';

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}
