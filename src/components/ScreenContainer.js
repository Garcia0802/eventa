import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { COLORS, SPACING } from '../styles/theme';

export default function ScreenContainer({ children, style }) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
