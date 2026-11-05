import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../styles/theme';

const TYPE_STYLES = {
  success: {
    container: { backgroundColor: '#EAF9F1', borderColor: '#7BC9A3' },
    text: { color: '#1A6C4F' },
    title: { color: '#1A6C4F' },
    icon: '✓',
  },
  error: {
    container: { backgroundColor: '#FDECEC', borderColor: '#E88A8A' },
    text: { color: '#A63E45' },
    title: { color: '#A63E45' },
    icon: '!',
  },
  info: {
    container: { backgroundColor: '#EAF1FF', borderColor: '#9CB7F5' },
    text: { color: '#2E4F99' },
    title: { color: '#2E4F99' },
    icon: 'i',
  },
};

export default function FeedbackBanner({ type = 'info', title, message, visible = true }) {
  if (!visible || !message) {
    return null;
  }

  const style = TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <View style={[styles.container, style.container]}>
      <View style={styles.iconWrap}>
        <Text style={[styles.iconText, style.title]}>{style.icon}</Text>
      </View>
      <View style={styles.textWrap}>
        {title ? <Text style={[styles.title, style.title]}>{title}</Text> : null}
        {message ? <Text style={[styles.message, style.text]}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconText: {
    fontSize: 15,
    fontWeight: '800',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
