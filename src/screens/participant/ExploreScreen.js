import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../styles/theme';

export default function ExploreScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [eventsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/events`),
          fetch(`${API_BASE_URL}/categories`),
        ]);

        const eventsData = await eventsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setCategories(['Todos', ...(categoriesData || []).map((item) => item.name)]);
      } catch (error) {
        setEvents([]);
        setCategories(['Todos']);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cities = useMemo(() => ['Todas', ...new Set(events.map((event) => event.city).filter(Boolean))], [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        (event.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory === 'Todos' || event.category_name === selectedCategory;
      const matchesCity = selectedCity === 'Todas' || event.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [events, search, selectedCategory, selectedCity]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Explorar eventos</Text>

      <TextInput
        style={styles.searchBox}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome ou descrição"
        placeholderTextColor={COLORS.textSecondary}
      />

      <Text style={styles.filterLabel}>Categoria</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.filterChip, item === selectedCategory && styles.filterChipSelected]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[styles.filterChipText, item === selectedCategory && styles.filterChipTextSelected]}>{item}</Text>
          </Pressable>
        )}
      />

      <Text style={styles.filterLabel}>Cidade</Text>
      <FlatList
        horizontal
        data={cities}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.filterChip, item === selectedCity && styles.filterChipSelected]}
            onPress={() => setSelectedCity(item)}
          >
            <Text style={[styles.filterChipText, item === selectedCity && styles.filterChipTextSelected]}>{item}</Text>
          </Pressable>
        )}
      />

      <Text style={styles.resultsLabel}>{loading ? 'Carregando...' : `${filteredEvents.length} eventos encontrados`}</Text>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Buscando eventos disponíveis...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum evento encontrado com os filtros atuais.</Text>
        </View>
      ) : (
        filteredEvents.map((event) => (
          <Pressable key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { event: {
            ...event,
            image: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
            category: event.category_name,
            organizer: event.organizer_name,
            date: new Date(event.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            time: new Date(event.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          }})}>
            <Image source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30' }} style={styles.eventImage} />
            <View style={styles.eventContent}>
              <Text style={styles.eventCategory}>{event.category_name}</Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>{new Date(event.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {event.city}</Text>
              <Text style={styles.eventMeta}>{event.venue}</Text>
            </View>
          </Pressable>
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
  searchBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  filterLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  categoryList: {
    paddingBottom: SPACING.md,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: COLORS.navySecondary,
    borderColor: COLORS.navySecondary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: COLORS.white,
  },
  resultsLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginVertical: SPACING.sm,
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
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  eventImage: {
    width: '100%',
    height: 170,
  },
  eventContent: {
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
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  eventMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
});
