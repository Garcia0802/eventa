import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function EventDetailsScreen({ route }) {
  const { event } = route.params || {};

  if (!event) {
    return (
      <ScreenContainer>
        <Text style={styles.emptyText}>Evento não encontrado.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Image source={{ uri: event.image }} style={styles.image} />

        <View style={styles.card}>
          <Text style={styles.category}>{event.category}</Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>{event.date} • {event.time}</Text>
          <Text style={styles.meta}>{event.city} • {event.venue}</Text>
          <Text style={styles.sectionLabel}>Descrição</Text>
          <Text style={styles.description}>{event.description}</Text>
          <Text style={styles.sectionLabel}>Organizador</Text>
          <Text style={styles.meta}>{event.organizer}</Text>
          <Text style={styles.sectionLabel}>Vagas disponíveis</Text>
          <Text style={styles.meta}>{event.capacity} participantes</Text>

          <PrimaryButton label="Participar" style={styles.button} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: SPACING.xl,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  category: {
    color: COLORS.blueAccent,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: 6,
  },
  description: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.xl,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingTop: SPACING.xl,
  },
});
