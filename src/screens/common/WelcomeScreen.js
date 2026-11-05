import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>EVENTA</Text>
        </View>

        <Text style={styles.title}>Descubra eventos que fazem sentido para você.</Text>
        <Text style={styles.subtitle}>
          Mobilidade, cultura, tecnologia e experiências em um só lugar.
        </Text>

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Entrar" onPress={() => navigation.navigate('Login')} />
          <SecondaryButton
            label="Criar conta"
            onPress={() => navigation.navigate('Register')}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  logoBox: {
    alignSelf: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
    shadowColor: '#101C35',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  logoText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: SPACING.md,
    lineHeight: 38,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  buttonGroup: {
    gap: SPACING.md,
  },
  secondaryButton: {
    backgroundColor: '#EAF1FF',
  },
});
