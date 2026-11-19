import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function ParticipantsScreen() {
  const { token } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/events/organizer/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setParticipants(response.ok && Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    loadParticipants();
  }, [token]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Participantes</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.navySecondary} />
      ) : participants.length === 0 ? (
        <View style={styles.card}><Text style={styles.email}>Nenhuma inscrição confirmada.</Text></View>
      ) : participants.map((person) => (
        <View key={person.registration_id} style={styles.card}>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.email}>{person.email}</Text>
          <Text style={styles.event}>{person.event_title}</Text>
          <Text style={styles.status}>Confirmado</Text>
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
    backgroundColor: '#EAFBF2',
    color: '#27885D',
  },
});
