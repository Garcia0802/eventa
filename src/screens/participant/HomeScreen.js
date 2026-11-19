import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { getUserInterests } from '../../data/interests';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../styles/theme';

export default function HomeScreen({ navigation }) {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const displayName = user?.name || 'Usuário';
  const interests = useMemo(() => getUserInterests(user), [user]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        const response = await fetch(token ? `${API_BASE_URL}/events/recommended` : `${API_BASE_URL}/events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível carregar os eventos.');
        }

        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [token]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        (event.title || '').toLowerCase().includes(query) ||
        (event.description || '').toLowerCase().includes(query) ||
        (event.city || '').toLowerCase().includes(query);

      const matchesCategory = true;
      return matchesSearch && matchesCategory;
    });
  }, [events, search]);

  const featuredEvent = filteredEvents[0] || events[0] || null;
  const upcomingEvents = filteredEvents.slice(0, 5);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Olá, {displayName.split(' ')[0]}!</Text>
            <Text style={styles.subGreeting}>
              {interests.length > 0 ? `Baseado em: ${interests.join(', ')}` : 'Encontre o próximo evento ideal.'}
            </Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchBox}
          placeholder="Buscar eventos"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.textSecondary}
        />

        <View style={styles.categoryRow}>
          {['Todos'].map((category, index) => (
            <View key={category} style={[styles.categoryChip, index === 0 && styles.categoryChipSelected]}>
              <Text style={[styles.categoryText, index === 0 && styles.categoryTextSelected]}>{category}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Carregando sugestões...</Text>
          </View>
        ) : featuredEvent ? (
          <>
            <View style={styles.featuredCard}>
              {featuredEvent.image_url ? (
                <Image source={{ uri: featuredEvent.image_url }} style={styles.featuredImage} />
              ) : (
                <View style={[styles.featuredImage, styles.imagePlaceholder]}><Text style={styles.imagePlaceholderText}>Evento</Text></View>
              )}
              <View style={styles.featuredInfo}>
                <Text style={styles.badge}>Destaque</Text>
                <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
                <Text style={styles.featuredMeta}>
                  {new Date(featuredEvent.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {featuredEvent.city}
                </Text>
                <Text style={styles.featuredMeta}>{featuredEvent.category_name}</Text>
                <PrimaryButton label="Ver evento" onPress={() => navigation.navigate('EventDetails', { eventId: featuredEvent.id })} style={styles.featuredButton} />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos eventos</Text>
              <Text style={styles.seeAll}>Ver todos</Text>
            </View>

            {upcomingEvents.map((event) => (
              <Pressable key={event.id} onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}>
                <View style={styles.eventCard}>
                  {event.image_url ? (
                    <Image source={{ uri: event.image_url }} style={styles.eventImage} />
                  ) : (
                    <View style={[styles.eventImage, styles.imagePlaceholder]}><Text style={styles.imagePlaceholderText}>Evento</Text></View>
                  )}
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventCategory}>{event.category_name}</Text>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>
                      {new Date(event.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(event.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.eventMeta}>{event.city} • {event.venue}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum evento encontrado no momento.</Text>
          </View>
        )}
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
  imagePlaceholder: {
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
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
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 15,
  },
});
