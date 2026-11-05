import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { demoEvents } from '../../data/demoEvents';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../styles/theme';

const categories = ['Todos', 'Esportes', 'Música', 'Tecnologia', 'Educação', 'Gastronomia', 'Cultura', 'Lazer', 'Negócios'];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const featuredEvent = demoEvents[0];
  const displayName = user?.name || 'Usuário';

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Olá, {displayName.split(' ')[0]}!</Text>
            <Text style={styles.subGreeting}>Encontre o próximo evento ideal.</Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchBox}
          placeholder="Buscar eventos"
          placeholderTextColor={COLORS.textSecondary}
        />

        <View style={styles.categoryRow}>
          {categories.map((category, index) => (
            <View key={category} style={[styles.categoryChip, index === 0 && styles.categoryChipSelected]}>
              <Text style={[styles.categoryText, index === 0 && styles.categoryTextSelected]}>{category}</Text>
            </View>
          ))}
        </View>

        <View style={styles.featuredCard}>
          <Image source={{ uri: featuredEvent.image }} style={styles.featuredImage} />
          <View style={styles.featuredInfo}>
            <Text style={styles.badge}>Destaque</Text>
            <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
            <Text style={styles.featuredMeta}>{featuredEvent.date} • {featuredEvent.city}</Text>
            <PrimaryButton label="Ver evento" onPress={() => navigation.navigate('Explore')} style={styles.featuredButton} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos eventos</Text>
          <Text style={styles.seeAll}>Ver todos</Text>
        </View>

        {demoEvents.slice(1, 5).map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventCategory}>{event.category}</Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>{event.date} • {event.time}</Text>
              <Text style={styles.eventMeta}>{event.city} • {event.venue}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subGreeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 20,
  },
  searchBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.navySecondary,
    borderColor: COLORS.navySecondary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: COLORS.white,
  },
  featuredCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredInfo: {
    padding: SPACING.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF1FF',
    color: COLORS.navySecondary,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: SPACING.sm,
  },
  featuredTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  featuredMeta: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  featuredButton: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  seeAll: {
    color: COLORS.blueAccent,
    fontWeight: '700',
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
    flexDirection: 'row',
  },
  eventImage: {
    width: 120,
    height: 120,
  },
  eventInfo: {
    flex: 1,
    padding: SPACING.md,
  },
  eventCategory: {
    color: COLORS.blueAccent,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
  },
  eventTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  eventMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
});
