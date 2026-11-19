import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function DashboardScreen({ navigation }) {
  const { token } = useAuth();
  const [summary, setSummary] = useState({ totalEvents: 0, totalRegistrations: 0, events: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/events/organizer/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao carregar painel.');
        setSummary(data);
      } catch (_) {
        setSummary({ totalEvents: 0, totalRegistrations: 0, events: [] });
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [token]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Painel</Text>

      {loading ? (
        <View style={styles.card}><ActivityIndicator color={COLORS.navySecondary} /></View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}><Text style={styles.statValue}>{summary.totalEvents}</Text><Text style={styles.statLabel}>Total de eventos</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{summary.totalRegistrations}</Text><Text style={styles.statLabel}>Total de inscrições</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Meus eventos</Text>
            {summary.events.length === 0 ? (
              <Text style={styles.meta}>Nenhum evento criado ainda.</Text>
            ) : summary.events.map((event) => (
              <View key={event.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listTitle}>{event.title}</Text>
                  <Text style={styles.listDate}>{new Date(event.start_at).toLocaleString('pt-BR')}</Text>
                </View>
                <Text style={styles.listBadge}>{event.confirmed_count || 0} inscritos</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ações rápidas</Text>
            <PrimaryButton label="Criar evento" onPress={() => navigation.navigate('CreateEvent')} style={styles.actionButton} />
          </View>
        </>
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
