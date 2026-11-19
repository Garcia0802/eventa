import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FeedbackBanner from '../../components/FeedbackBanner';
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
  const [feedback, setFeedback] = useState({ type: 'info', title: '', message: '' });
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const statusQuery = statusFilter === 'TODAS' ? '' : `?status=${statusFilter}`;
      const response = await fetch(`${API_BASE_URL}/admin/organizer-requests${statusQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar solicitações.');
      }

      setRequests(data);
    } catch (error) {
      console.log('[Organizador] Erro ao carregar solicitações:', error);
      setFeedback({
        type: 'error',
        title: 'Erro ao carregar',
        message: error.message || 'Não foi possível carregar as solicitações.',
      });
      if (Platform.OS !== 'web') {
        Alert.alert('Erro', error.message || 'Não foi possível carregar as solicitações.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const submitReview = async (requestId, decision) => {
    console.log('[Organizador] Confirmado:', { requestId, decision });

    try {
      const url = `${API_BASE_URL}/admin/organizer-requests/${requestId}/review`;
      console.log('[Organizador] Enviando PATCH:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision }),
      });

      console.log('[Organizador] Status HTTP:', response.status);

      const data = await response.json();
      console.log('[Organizador] Resposta da API:', data);

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Erro ao atualizar a solicitação.');
      }

      setFeedback({
        type: 'success',
        title: 'Solicitação atualizada',
        message: data.message || 'A ação foi concluída com sucesso.',
      });

      await refreshUser();
      await loadRequests();
      console.log('[Organizador] Solicitações recarregadas após decisão');
    } catch (error) {
      console.log('[Organizador] Erro ao revisar:', error);
      setFeedback({
        type: 'error',
        title: 'Erro ao processar',
        message: error.message || 'Não foi possível atualizar a solicitação.',
      });

      if (Platform.OS !== 'web') {
        Alert.alert('Erro', error.message || 'Não foi possível atualizar a solicitação.');
      }
    }
  };

  const handleReview = (requestId, decision) => {
    console.log('[Organizador] Solicitação selecionada:', requestId);
    console.log('[Organizador] Decisão selecionada:', decision);

    const actionLabel = decision === 'APPROVE' ? 'aprovar' : 'rejeitar';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Deseja ${actionLabel} esta solicitação?`);
      console.log('[Organizador] Confirmação web:', confirmed);

      if (confirmed) {
        submitReview(requestId, decision);
      } else {
        console.log('[Organizador] Revisão cancelada:', requestId);
      }
      return;
    }

    Alert.alert('Confirmar ação', `Deseja ${actionLabel} esta solicitação?`, [
      {
        text: 'Cancelar',
        style: 'cancel',
        onPress: () => console.log('[Organizador] Revisão cancelada:', requestId),
      },
      {
        text: actionLabel === 'aprovar' ? 'Aprovar' : 'Rejeitar',
        style: actionLabel === 'aprovar' ? 'default' : 'destructive',
        onPress: () => submitReview(requestId, decision),
      },
    ]);
  };

  const filteredRequests = requests.filter((request) => request.status === statusFilter);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Solicitações de organizadores</Text>

        <FeedbackBanner
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          visible={Boolean(feedback.message)}
        />

        <View style={styles.filtersRow}>
          {['TODAS', 'PENDING', 'APPROVED', 'REJECTED'].map((value) => {
            const label = value === 'TODAS' ? 'Todas' : value.charAt(0) + value.slice(1).toLowerCase();
            return (
              <Pressable
                key={value}
                style={[styles.filterChip, statusFilter === value && styles.filterChipSelected]}
                onPress={() => setStatusFilter(value)}
              >
                <Text style={[styles.filterText, statusFilter === value && styles.filterTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <Text style={styles.empty}>Carregando solicitações...</Text>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.empty}>Nenhuma solicitação {statusFilter.toLowerCase()} no momento.</Text>
          </View>
        ) : (
          filteredRequests.map((request) => {
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
                      onPress={() => {
                        console.log('[Organizador] Botão APROVAR pressionado:', request.id);
                        handleReview(request.id, 'APPROVE');
                      }}
                      style={styles.approveButton}
                    />
                    <PrimaryButton
                      label="Rejeitar"
                      onPress={() => {
                        console.log('[Organizador] Botão REJEITAR pressionado:', request.id);
                        handleReview(request.id, 'REJECT');
                      }}
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
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
  },
  filterChipSelected: {
    backgroundColor: COLORS.navySecondary,
    borderColor: COLORS.navySecondary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextSelected: {
    color: COLORS.white,
  },
});
