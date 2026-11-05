import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const profileName = user?.name || 'Usuário';
  const profileEmail = user?.email || 'sem-email@eventa.com';
  const profileCity = user?.city || 'Cidade não informada';

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

  return (
    <ScreenContainer>
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
        <Text style={styles.infoLabel}>Preferências</Text>
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>Tecnologia</Text>
          <Text style={styles.tag}>Música</Text>
          <Text style={styles.tag}>Esportes</Text>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair da conta</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EAF1FF',
    color: COLORS.navySecondary,
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
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
