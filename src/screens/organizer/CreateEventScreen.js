import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Platform } from 'react-native';

import FeedbackBanner from '../../components/FeedbackBanner';
import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

const formatDateValue = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatTimeValue = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const normalizeDateTimePayload = (dateValue, startTimeValue, endTimeValue) => {
  const normalizedDate = formatDateToDb(dateValue);
  const startDateTime = normalizedDate && startTimeValue ? `${normalizedDate}T${startTimeValue}:00` : null;
  const endDateTime = normalizedDate && endTimeValue ? `${normalizedDate}T${endTimeValue}:00` : null;

  return { normalizedDate, startDateTime, endDateTime };
};

const formatDateToDb = (dateValue) => {
  if (!dateValue) return '';

  const parts = dateValue.split('/');
  if (parts.length !== 3) return '';

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

const formatDateForInput = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const isValidTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value || '');

export default function CreateEventScreen() {
  const { user, token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', title: '', message: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    event_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    city: '',
    capacity: '',
    image_url: '',
  });

  useEffect(() => {
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      setFeedback({
        type: 'error',
        title: 'Permissão negada',
        message: 'Apenas organizadores e administradores podem criar eventos.',
      });
      return;
    }

    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao carregar categorias.');
        }

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        setFeedback({
          type: 'error',
          title: 'Categorias indisponíveis',
          message: 'Não foi possível carregar as categorias no momento.',
        });
      }
    };

    loadCategories();
  }, [user]);

  const updateField = (key, value) => {
    if (key === 'event_date') {
      setForm((prev) => ({ ...prev, [key]: formatDateValue(value) }));
      return;
    }

    if (key === 'start_time' || key === 'end_time') {
      setForm((prev) => ({ ...prev, [key]: formatTimeValue(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateEvent = async () => {
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      const message = 'Você não tem permissão para criar eventos.';
      setFeedback({ type: 'error', title: 'Permissão negada', message });
      Alert.alert('Atenção', message);
      return;
    }

    if (!form.title || !form.description || !form.category_id || !form.event_date || !form.start_time || !form.venue || !form.city || !form.capacity) {
      const message = 'Preencha todos os campos obrigatórios do evento.';
      setFeedback({ type: 'error', title: 'Campos obrigatórios', message });
      Alert.alert('Atenção', message);
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.event_date)) {
      const message = 'Use a data no formato DD/MM/AAAA.';
      setFeedback({ type: 'error', title: 'Formato inválido', message });
      Alert.alert('Atenção', message);
      return;
    }

    if (!isValidTime(form.start_time)) {
      const message = 'A hora de início deve estar no formato HH:MM.';
      setFeedback({ type: 'error', title: 'Hora inválida', message });
      Alert.alert('Atenção', message);
      return;
    }

    if (form.end_time && !isValidTime(form.end_time)) {
      const message = 'O horário de término deve estar no formato HH:MM.';
      setFeedback({ type: 'error', title: 'Hora inválida', message });
      Alert.alert('Atenção', message);
      return;
    }

    const { normalizedDate, startDateTime, endDateTime } = normalizeDateTimePayload(form.event_date, form.start_time, form.end_time);

    if (!normalizedDate || !startDateTime) {
      const message = 'Data ou hora inválida. Revise os campos.';
      setFeedback({ type: 'error', title: 'Dados inválidos', message });
      Alert.alert('Atenção', message);
      return;
    }

    if (form.end_time && form.start_time && form.end_time <= form.start_time) {
      const message = 'O horário de término precisa ser depois do início.';
      setFeedback({ type: 'error', title: 'Horário inválido', message });
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
          title: form.title.trim(),
          description: form.description.trim(),
          category_id: Number(form.category_id),
          start_at: startDateTime,
          end_at: endDateTime,
          venue: form.venue.trim(),
          city: form.city.trim(),
          capacity: Number(form.capacity),
          image_url: form.image_url.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Erro ao criar evento.');
      }

      setFeedback({
        type: 'success',
        title: 'Evento criado',
        message: 'Seu evento foi registrado com sucesso no banco de dados.',
      });
      Alert.alert('Sucesso', 'Evento criado com sucesso!');
      setForm({
        title: '',
        description: '',
        category_id: '',
        event_date: '',
        start_time: '',
        end_time: '',
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

        {user && (user.role === 'ORGANIZER' || user.role === 'ADMIN') ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome do evento"
              value={form.title}
              onChangeText={(value) => updateField('title', value)}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Descrição do evento"
              value={form.description}
              onChangeText={(value) => updateField('description', value)}
            />

            <View style={styles.selectWrap}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.selectBox}>
                <Text style={[styles.selectText, !form.category_id && styles.placeholderText]}>
                  {categories.find((category) => String(category.id) === String(form.category_id))?.name || 'Selecione uma categoria'}
                </Text>
              </View>
              {categories.length > 0 && (
                <View style={styles.optionsBox}>
                  {categories.map((category) => (
                    <Text
                      key={category.id}
                      style={[styles.optionText, String(category.id) === String(form.category_id) && styles.optionSelectedText]}
                      onPress={() => updateField('category_id', String(category.id))}
                    >
                      {category.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Dia</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  value={form.event_date}
                  onChangeText={(value) => updateField('event_date', value)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Hora início</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={form.start_time}
                  onChangeText={(value) => updateField('start_time', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Horário de término (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={form.end_time}
                onChangeText={(value) => updateField('end_time', value)}
                keyboardType="numeric"
              />
            </View>

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
              placeholder="URL da imagem"
              value={form.image_url}
              onChangeText={(value) => updateField('image_url', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <PrimaryButton label={loading ? 'Salvando...' : 'Salvar evento'} onPress={handleCreateEvent} />
          </View>
        ) : (
          <View style={styles.lockedState}>
            <Text style={styles.lockedText}>Você precisa ser organizador ou administrador para criar eventos.</Text>
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
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  form: {
    gap: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
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
  selectWrap: {
    marginBottom: 4,
  },
  selectBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 52,
    justifyContent: 'center',
  },
  selectText: {
    color: COLORS.text,
    fontSize: 16,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  optionsBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingVertical: 6,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 15,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  optionSelectedText: {
    color: COLORS.blueAccent,
    fontWeight: '700',
    backgroundColor: '#EEF4FF',
  },
  lockedState: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  lockedText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
