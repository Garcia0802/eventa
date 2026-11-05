import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import FeedbackBanner from '../../components/FeedbackBanner';
import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function CreateEventScreen() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', title: '', message: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    start_at: '',
    venue: '',
    city: '',
    capacity: '',
    image_url: '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao carregar categorias.');
        }
        setCategories(data);
      } catch (error) {
        setFeedback({
          type: 'error',
          title: 'Categorias indisponíveis',
          message: 'Não foi possível carregar as categorias no momento.',
        });
      }
    };

    loadCategories();
  }, []);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreateEvent = async () => {
    if (!form.title || !form.description || !form.category_id || !form.start_at || !form.venue || !form.city || !form.capacity) {
      const message = 'Preencha todos os campos obrigatórios do evento.';
      setFeedback({ type: 'error', title: 'Campos obrigatórios', message });
      Alert.alert('Atenção', message);
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: 'info', title: 'Salvando evento', message: 'Registrando seu evento no banco...' });

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
          capacity: Number(form.capacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Erro ao criar evento.');
      }

      setFeedback({
        type: 'success',
        title: 'Evento criado',
        message: 'Seu evento foi registrado com sucesso no Eventa.',
      });
      Alert.alert('Sucesso', 'Evento criado com sucesso!');
      setForm({
        title: '',
        description: '',
        category_id: '',
        start_at: '',
        venue: '',
        city: '',
        capacity: '',
        image_url: '',
      });
    } catch (error) {
      const message = error.message || 'Não foi possível criar o evento.';
      setFeedback({ type: 'error', title: 'Erro ao criar evento', message });
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Criar evento</Text>

        <FeedbackBanner
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          visible={Boolean(feedback.message)}
        />

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Título"
            value={form.title}
            onChangeText={(value) => updateField('title', value)}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="Descrição"
            value={form.description}
            onChangeText={(value) => updateField('description', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Categoria (ID da categoria)"
            keyboardType="numeric"
            value={form.category_id}
            onChangeText={(value) => updateField('category_id', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Data e hora (YYYY-MM-DDTHH:MM:SS)"
            value={form.start_at}
            onChangeText={(value) => updateField('start_at', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Local"
            value={form.venue}
            onChangeText={(value) => updateField('venue', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={form.city}
            onChangeText={(value) => updateField('city', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Capacidade máxima"
            keyboardType="numeric"
            value={form.capacity}
            onChangeText={(value) => updateField('capacity', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Imagem (URL opcional)"
            value={form.image_url}
            onChangeText={(value) => updateField('image_url', value)}
          />

          <PrimaryButton label={loading ? 'Salvando...' : 'Salvar evento'} onPress={handleCreateEvent} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  form: {
    gap: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 52,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
