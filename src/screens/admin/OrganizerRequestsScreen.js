import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

const STATUS_COLORS = {
  PENDING: { background: '#FFF3E0', text: '#B26A00' },
  APPROVED: { background: '#EAF9F1', text: '#1C7B52' },
  REJECTED: { background: '#FDECEC', text: '#A63E45' },
};

export default function OrganizerRequestsScreen() {
  const { token, refreshUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/organizer-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar solicitações.');
      }

      setRequests(data);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível carregar as solicitações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleReview = async (requestId, decision) => {
    const actionLabel = decision === 'APPROVE' ? 'aprovar' : 'rejeitar';
    Alert.alert('Confirmar ação', `Deseja ${actionLabel} esta solicitação?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: actionLabel === 'aprovar' ? 'Aprovar' : 'Rejeitar',
        style: actionLabel === 'aprovar' ? 'default' : 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/admin/organizer-requests/${requestId}/review`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ decision }),
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.message || data.errors?.[0]?.msg || 'Erro ao atualizar a solicitação.');
            }

            await refreshUser();
            await loadRequests();
            Alert.alert('Sucesso', data.message || 'Solicitação atualizada.');
          } catch (error) {
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a solicitação.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Solicitações de organizadores</Text>

        {loading ? (
          <Text style={styles.empty}>Carregando solicitações...</Text>
        ) : requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.empty}>Nenhuma solicitação pendente no momento.</Text>
          </View>
        ) : (
          requests.map((request) => {
            const statusStyle = STATUS_COLORS[request.status] || STATUS_COLORS.PENDING;

            return (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.headerRow}>
                  <View>
                    <Text style={styles.name}>{request.requester_name}</Text>
                    <Text style={styles.email}>{request.requester_email}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.background }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{request.status}</Text>
                  </View>
                </View>

                <Text style={styles.label}>Justificativa</Text>
                <Text style={styles.reason}>{request.reason}</Text>
                <Text style={styles.date}>{new Date(request.created_at).toLocaleString('pt-BR')}</Text>

                {request.status === 'PENDING' && (
                  <View style={styles.actionsRow}>
                    <PrimaryButton
                      label="Aprovar"
                      onPress={() => handleReview(request.id, 'APPROVE')}
                      style={styles.approveButton}
                    />
                    <PrimaryButton
                      label="Rejeitar"
                      onPress={() => handleReview(request.id, 'REJECT')}
                      style={styles.rejectButton}
                    />
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.sm,
    marginBottom: 4,
    fontWeight: '700',
  },
  reason: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  approveButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#D95B5B',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
