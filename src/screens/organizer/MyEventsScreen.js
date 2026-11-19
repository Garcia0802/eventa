import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function MyEventsScreen() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/organizer/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEvents(response.ok ? data.events || [] : []);
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [token]);

  const cancelEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível cancelar o evento.');
      }

      setEvents((current) =>
        current.map((event) => (event.id === eventId ? { ...event, status: 'CANCELLED' } : event))
      );

      if (Platform.OS === 'web') {
        window.alert(data.message);
      } else {
        Alert.alert('Evento cancelado', data.message);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert('Erro', error.message);
      }
    }
  };

  const confirmCancelEvent = (eventId, title) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Deseja cancelar o evento "${title}"?`)) {
        cancelEvent(eventId);
      }
      return;
    }

    Alert.alert('Cancelar evento', `Deseja cancelar o evento "${title}"?`, [
      { text: 'Não', style: 'cancel' },
      { text: 'Cancelar evento', style: 'destructive', onPress: () => cancelEvent(eventId) },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Meus eventos</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.navySecondary} />
      ) : events.length === 0 ? (
        <View style={styles.card}><Text style={styles.meta}>Nenhum evento criado ainda.</Text></View>
      ) : events.map((event) => (
        <View key={event.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={[styles.status, event.status === 'CANCELLED' ? styles.cancelled : styles.published]}>{event.status}</Text>
          </View>
          <Text style={styles.meta}>{new Date(event.start_at).toLocaleString('pt-BR')}</Text>
          <Text style={styles.meta}>{event.confirmed_count || 0} participantes confirmados</Text>
          {event.status !== 'CANCELLED' && (
            <Pressable onPress={() => confirmCancelEvent(event.id, event.title)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar evento</Text>
            </Pressable>
          )}
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
  cancelButton: {
    marginTop: SPACING.sm,
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#D95B5B',
    borderRadius: RADIUS.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#B83F3F',
    fontWeight: '700',
  },
});
