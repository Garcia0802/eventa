import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId, event: initialEvent } = route.params || {};
  const { token } = useAuth();
  const [event, setEvent] = useState(initialEvent || null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadEvent = async () => {
    if (!eventId && !initialEvent?.id) return;

    try {
      const id = eventId || initialEvent.id;
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Evento não encontrado.');
      }

      setEvent(data);

      if (token) {
        const registrationsResponse = await fetch(`${API_BASE_URL}/events/my-registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const registrations = await registrationsResponse.json();
        if (registrationsResponse.ok) {
          setRegistered(registrations.some((item) => item.event_id === data.id && item.status === 'CONFIRMED'));
        }
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível carregar o evento.');
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId, token]);

  const handleConfirmPresence = async () => {
    if (!token || !event?.id) {
      Alert.alert('Login necessário', 'Faça login para confirmar sua presença.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível confirmar sua presença.');
      }

      setRegistered(true);
      await loadEvent();
      Alert.alert('Presença confirmada', data.message);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível confirmar sua presença.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPresence = async () => {
    if (!token || !event?.id) return;

    Alert.alert('Cancelar inscrição', 'Deseja cancelar sua presença neste evento?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Cancelar presença',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/events/${event.id}/register`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Não foi possível cancelar sua presença.');
            }

            setRegistered(false);
            await loadEvent();
            Alert.alert('Inscrição cancelada', data.message);
          } catch (error) {
            Alert.alert('Erro', error.message || 'Não foi possível cancelar sua presença.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const openTab = (tabName) => {
    navigation.navigate('AppTabs', { screen: tabName });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      openTab('Explore');
    }
  };

  if (!event) {
    return (
      <ScreenContainer>
        <Text style={styles.emptyText}>Evento não encontrado.</Text>
      </ScreenContainer>
    );
  }

  const capacity = Number(event.capacity || 0);
  const confirmedCount = Number(event.confirmed_count || 0);
  const available = Math.max(capacity - confirmedCount, 0);

  return (
    <ScreenContainer>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.topTitle}>Evento</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}><Text style={styles.imagePlaceholderText}>Evento</Text></View>
        )}

        <View style={styles.card}>
          <Text style={styles.category}>{event.category_name || 'Evento'}</Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>{new Date(event.start_at).toLocaleString('pt-BR')}</Text>
          {event.end_at ? <Text style={styles.meta}>Término: {new Date(event.end_at).toLocaleString('pt-BR')}</Text> : null}
          <Text style={styles.meta}>{event.city} • {event.venue}</Text>

          <Text style={styles.sectionLabel}>Descrição</Text>
          <Text style={styles.description}>{event.description}</Text>

          <Text style={styles.sectionLabel}>Organizador</Text>
          <Text style={styles.meta}>{event.organizer_name}</Text>

          <Text style={styles.sectionLabel}>Vagas disponíveis</Text>
          <Text style={styles.meta}>{available} de {capacity} vagas</Text>

          {registered ? (
            <PrimaryButton
              label={loading ? 'Cancelando...' : 'Cancelar presença'}
              onPress={handleCancelPresence}
              style={styles.cancelButton}
            />
          ) : (
            <PrimaryButton
              label={loading ? 'Confirmando...' : 'Confirmar presença'}
              onPress={handleConfirmPresence}
              style={styles.button}
            />
          )}
        </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: { paddingBottom: SPACING.xl },
  image: { width: '100%', height: 220, borderRadius: RADIUS.lg, marginBottom: SPACING.md },
  imagePlaceholder: { width: '100%', height: 220, borderRadius: RADIUS.lg, marginBottom: SPACING.md, backgroundColor: '#DCE7F5', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { color: COLORS.navy, fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md },
  category: { color: COLORS.blueAccent, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  meta: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 6 },
  sectionLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginTop: SPACING.md, marginBottom: 6 },
  description: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  button: { marginTop: SPACING.xl },
  cancelButton: { marginTop: SPACING.xl, backgroundColor: '#D95B5B' },
  emptyText: { fontSize: 18, color: COLORS.textSecondary, textAlign: 'center', paddingTop: SPACING.xl },
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
