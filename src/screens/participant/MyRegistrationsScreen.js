import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

const registrations = [
  { id: 1, title: 'Festival de Música Indie', status: 'Confirmada', date: '22 nov' },
  { id: 2, title: 'Workshop de Programação', status: 'Confirmada', date: '28 nov' },
  { id: 3, title: 'Palestra de Tecnologia e IA', status: 'Cancelada', date: '01 dez' },
];

export default function MyRegistrationsScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Minhas inscrições</Text>

      <View style={styles.tabsContainer}>
        <Text style={[styles.tab, styles.tabActive]}>Confirmadas</Text>
        <Text style={styles.tab}>Histórico</Text>
        <Text style={styles.tab}>Canceladas</Text>
      </View>

      {registrations.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={[styles.status, item.status === 'Cancelada' ? styles.statusCancelled : styles.statusConfirmed]}>
              {item.status}
            </Text>
          </View>
        </View>
      ))}
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 6,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  tabActive: {
    backgroundColor: '#EAF1FF',
    color: COLORS.navySecondary,
    borderRadius: RADIUS.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  eventTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusConfirmed: {
    backgroundColor: '#EAFBF2',
    color: '#27885D',
  },
  statusCancelled: {
    backgroundColor: '#FDECEC',
    color: '#C95454',
  },
});
