import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function MyRegistrationsScreen() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistrations = async () => {
      if (!token) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/events/my-registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao carregar inscrições.');
        }

        setRegistrations(Array.isArray(data) ? data : []);
      } catch (error) {
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, [token]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Minhas inscrições</Text>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={COLORS.navySecondary} />
          <Text style={styles.emptyText}>Carregando inscrições...</Text>
        </View>
      ) : registrations.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.emptyText}>Você ainda não se inscreveu em nenhum evento.</Text>
        </View>
      ) : (
        registrations.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.date}>{new Date(item.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</Text>
              <Text style={[styles.status, item.status === 'CANCELLED' ? styles.statusCancelled : styles.statusConfirmed]}>
                {item.status === 'CANCELLED' ? 'Cancelada' : 'Confirmada'}
              </Text>
            </View>
          </View>
        ))
      )}
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
  stateBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    marginTop: SPACING.sm,
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
