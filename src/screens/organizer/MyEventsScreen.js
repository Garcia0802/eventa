import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

const myEvents = [
  { title: 'Workshop de Programação', status: 'Publicado', date: '28 nov', participants: 45 },
  { title: 'Palestra de Tecnologia', status: 'Publicando', date: '01 dez', participants: 67 },
  { title: 'Encontro de Empreendedores', status: 'Cancelado', date: '08 dez', participants: 20 },
];

export default function MyEventsScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Meus eventos</Text>

      {myEvents.map((event) => (
        <View key={event.title} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={[styles.status, event.status === 'Cancelado' ? styles.cancelled : styles.published]}>{event.status}</Text>
          </View>
          <Text style={styles.meta}>{event.date}</Text>
          <Text style={styles.meta}>{event.participants} participantes</Text>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  eventTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: SPACING.sm,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  published: {
    backgroundColor: '#EAFBF2',
    color: '#27885D',
  },
  cancelled: {
    backgroundColor: '#FDECEC',
    color: '#C95454',
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
});
