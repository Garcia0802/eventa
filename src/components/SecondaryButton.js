import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../styles/theme';

export default function SecondaryButton({ label, onPress, style, textStyle }) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#EAF1FF',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  text: {
    color: COLORS.navySecondary,
    fontSize: 16,
    fontWeight: '700',
  },
});
