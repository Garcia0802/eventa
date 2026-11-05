import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

const participants = [
  { name: 'Lucas Pereira', email: 'lucas@email.com', event: 'Workshop de Programação', status: 'Confirmado' },
  { name: 'Beatriz Santos', email: 'beatriz@email.com', event: 'Palestra de Tecnologia', status: 'Pendente' },
  { name: 'Rafael Costa', email: 'rafael@email.com', event: 'Encontro de Empreendedores', status: 'Confirmado' },
];

export default function ParticipantsScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Participantes</Text>

      {participants.map((person) => (
        <View key={person.email} style={styles.card}>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.email}>{person.email}</Text>
          <Text style={styles.event}>{person.event}</Text>
          <Text style={[styles.status, person.status === 'Confirmado' ? styles.confirmed : styles.pending]}>{person.status}</Text>
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
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  event: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  status: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  confirmed: {
    backgroundColor: '#EAFBF2',
    color: '#27885D',
  },
  pending: {
    backgroundColor: '#FFF3D9',
    color: '#B77D00',
  },
});
