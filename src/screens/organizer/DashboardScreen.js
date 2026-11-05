import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

const stats = [
  { label: 'Total de eventos', value: '12' },
  { label: 'Total de inscrições', value: '840' },
];

const upcoming = [
  { title: 'Workshop de Programação', date: '28 nov' },
  { title: 'Palestra de Tecnologia', date: '01 dez' },
  { title: 'Encontro de Empreendedores', date: '08 dez' },
];

export default function DashboardScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Painel</Text>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Próximos eventos</Text>
        {upcoming.map((item) => (
          <View key={item.title} style={styles.listItem}>
            <View>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listDate}>{item.date}</Text>
            </View>
            <Text style={styles.listBadge}>Ativo</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <PrimaryButton label="Criar evento" style={styles.actionButton} />
        <PrimaryButton label="Ver inscritos" style={[styles.actionButton, styles.secondaryAction]} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statValue: {
    color: COLORS.navy,
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listTitle: {
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  listDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  listBadge: {
    backgroundColor: '#EAFBF2',
    color: '#27885D',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  secondaryAction: {
    backgroundColor: COLORS.navySecondary,
  },
});
