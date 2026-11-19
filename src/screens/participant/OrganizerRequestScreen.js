import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import FeedbackBanner from '../../components/FeedbackBanner';
import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

const MAX_REASON_LENGTH = 300;

export default function OrganizerRequestScreen({ navigation }) {
  const { token, refreshUser } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', title: '', message: '' });

  const remainingChars = useMemo(() => MAX_REASON_LENGTH - reason.length, [reason]);

  const openTab = (tabName) => {
    navigation.navigate('AppTabs', { screen: tabName });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else openTab('Profile');
  };

  const handleSubmit = async () => {
    const trimmed = reason.trim();

    if (!trimmed) {
      const message = 'Escreva a justificativa para continuar.';
      setFeedback({ type: 'error', title: 'Campo obrigatório', message });
      Alert.alert('Atenção', message);
      return;
    }

    if (trimmed.length > MAX_REASON_LENGTH) {
      const message = 'A justificativa deve ter até 300 caracteres.';
      setFeedback({ type: 'error', title: 'Limite excedido', message });
      Alert.alert('Atenção', message);
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: 'info', title: 'Enviando', message: 'Registrando sua solicitação...' });

      const response = await fetch(`${API_BASE_URL}/organizer-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Não foi possível enviar sua solicitação.');
      }

      setFeedback({
        type: 'success',
        title: 'Solicitação enviada',
        message: data.message || 'Sua solicitação foi enviada com sucesso.',
      });
      setReason('');
      if (refreshUser) {
        await refreshUser();
      }
      Alert.alert('Sucesso', data.message || 'Sua solicitação foi enviada com sucesso.');
      navigation.goBack();
    } catch (error) {
      const message = error.message || 'Não foi possível enviar a solicitação.';
      setFeedback({ type: 'error', title: 'Erro ao enviar', message });
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Quero me tornar organizador</Text>
        <Text style={styles.subtitle}>
          Quer divulgar e gerenciar seus próprios eventos no Eventa? Envie uma solicitação para obter acesso às ferramentas de organização.
        </Text>

        <FeedbackBanner
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          visible={Boolean(feedback.message)}
        />

        <View style={styles.card}>
          <Text style={styles.label}>Por que você deseja se tornar organizador?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            maxLength={MAX_REASON_LENGTH}
            placeholder="Descreva sua motivação..."
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{remainingChars} caracteres restantes</Text>
        </View>

        <PrimaryButton label={loading ? 'Enviando...' : 'Enviar solicitação'} onPress={handleSubmit} />
      </ScrollView>

      <View style={styles.bottomMenu}>
        <Pressable style={styles.menuItem} onPress={() => openTab('Home')}>
          <Ionicons name="home-outline" size={21} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>Início</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => openTab('Explore')}>
          <Ionicons name="compass-outline" size={21} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>Explorar</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => openTab('MyRegistrations')}>
          <Ionicons name="calendar-outline" size={21} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>Inscrições</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => openTab('Profile')}>
          <Ionicons name="person-outline" size={21} color={COLORS.textSecondary} />
          <Text style={styles.menuText}>Perfil</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: SPACING.xl,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    zIndex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 140,
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
  },
  counter: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'right',
  },
  bottomMenu: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
});
