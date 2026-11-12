import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { INTEREST_OPTIONS } from '../../data/interests';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function ProfileScreen({ navigation }) {
  const { user, token, logout, refreshUser } = useAuth();
  const [requestStatus, setRequestStatus] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);

  const profileName = user?.name || 'Usuário';
  const profileEmail = user?.email || 'sem-email@eventa.com';
  const profileCity = user?.city || 'Cidade não informada';

  useEffect(() => {
    const nextInterests = [user?.category_1, user?.category_2, user?.category_3].filter(Boolean);
    setSelectedInterests(nextInterests);
  }, [user]);

  useEffect(() => {
    const fetchRequestStatus = async () => {
      if (!token || !user || user.role === 'ORGANIZER' || user.role === 'ADMIN') {
        setRequestStatus(null);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/organizer-requests/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao consultar solicitação.');
        }

        setRequestStatus(data.currentStatus || null);
      } catch (error) {
        setRequestStatus(null);
      }
    };

    fetchRequestStatus();
  }, [token, user]);

  const toggleInterest = (interest) => {
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length >= 3) {
        Alert.alert('Limite de 3 interesses', 'Você pode escolher até 3 interesses.');
        return current;
      }

      return [...current, interest];
    });
  };

  const saveInterests = async () => {
    if (!token) {
      return;
    }

    try {
      setSavingInterests(true);

      const payload = {
        category_1: selectedInterests[0] || null,
        category_2: selectedInterests[1] || null,
        category_3: selectedInterests[2] || null,
      };

      const response = await fetch(`${API_BASE_URL}/auth/profile/interests`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Erro ao salvar interesses.');
      }

      await refreshUser();
      Alert.alert('Sucesso', 'Seus interesses foram salvos.');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar os interesses.');
    } finally {
      setSavingInterests(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  const handleOpenRequest = async () => {
    if (user?.role === 'ORGANIZER') {
      return;
    }

    navigation.navigate('OrganizerRequest');
  };

  const renderOrganizerSection = () => {
    if (user?.role === 'ORGANIZER') {
      return null;
    }

    if (user?.role === 'ADMIN') {
      return null;
    }

    if (requestStatus === 'PENDING') {
      return (
        <View style={styles.organizerCard}>
          <Text style={styles.sectionTitle}>Organize eventos no Eventa</Text>
          <Text style={styles.statusText}>Solicitação em análise.</Text>
        </View>
      );
    }

    if (requestStatus === 'APPROVED') {
      return (
        <View style={styles.organizerCard}>
          <Text style={styles.sectionTitle}>Organize eventos no Eventa</Text>
          <Text style={styles.statusSuccess}>Parabéns! Sua solicitação foi aprovada. Agora você pode organizar eventos no Eventa.</Text>
          {refreshUser ? <Text style={styles.inlineHint} onPress={() => refreshUser()}>Atualizar perfil</Text> : null}
        </View>
      );
    }

    if (requestStatus === 'REJECTED') {
      return (
        <View style={styles.organizerCard}>
          <Text style={styles.sectionTitle}>Organize eventos no Eventa</Text>
          <Text style={styles.statusError}>Sua solicitação não foi aprovada.</Text>
          <Pressable style={styles.primaryButton} onPress={handleOpenRequest}>
            <Text style={styles.primaryButtonText}>Quero me tornar organizador</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.organizerCard}>
        <Text style={styles.sectionTitle}>Organize eventos no Eventa</Text>
        <Pressable style={styles.primaryButton} onPress={handleOpenRequest}>
          <Text style={styles.primaryButtonText}>Quero me tornar organizador</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profileName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profileName}</Text>
          <Text style={styles.email}>{profileEmail}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.infoLabel}>Cidade</Text>
          <Text style={styles.infoValue}>{profileCity}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.infoLabel}>Interesses</Text>
          <Text style={styles.helperText}>Escolha até 3 interesses para receber sugestões mais parecidas.</Text>
          <View style={styles.tagsRow}>
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);

              return (
                <Pressable
                  key={interest}
                  style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{interest}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={styles.saveButton} onPress={saveInterests} disabled={savingInterests}>
            <Text style={styles.saveButtonText}>{savingInterests ? 'Salvando...' : 'Salvar interesses'}</Text>
          </Pressable>
        </View>

        {renderOrganizerSection()}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '700',
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: '#EAF1FF',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagButtonSelected: {
    backgroundColor: COLORS.navySecondary,
  },
  tagText: {
    color: COLORS.navySecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextSelected: {
    color: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.blueAccent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  organizerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  statusText: {
    color: '#B26A00',
    fontWeight: '700',
  },
  statusSuccess: {
    color: '#1C7B52',
    fontWeight: '700',
    lineHeight: 22,
  },
  statusError: {
    color: '#A63E45',
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  inlineHint: {
    color: COLORS.blueAccent,
    marginTop: SPACING.sm,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: COLORS.blueAccent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  logoutButton: {
    marginTop: SPACING.md,
    backgroundColor: '#FDECEC',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '800',
  },
});
