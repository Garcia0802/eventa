import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import FeedbackBanner from '../../components/FeedbackBanner';
import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', title: '', message: '' });
  const { setUser, setToken } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      const message = 'Preencha nome, e-mail e senha para criar sua conta.';
      setFeedback({ type: 'error', title: 'Campos obrigatórios', message });
      Alert.alert('Atenção', message);
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: 'info', title: 'Cadastrando', message: 'Criando sua conta no Eventa...' });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, city }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Erro ao cadastrar usuário.');
      }

      setUser(data.user);
      setToken(data.token);
      setFeedback({
        type: 'success',
        title: 'Conta criada',
        message: `Sua conta foi criada com sucesso, ${data.user.name}!`,
      });
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      const message = error.message || 'Não foi possível concluir o cadastro.';
      setFeedback({ type: 'error', title: 'Não foi possível cadastrar', message });
      Alert.alert('Erro no cadastro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Cadastre-se para explorar eventos incríveis.</Text>
      </View>

      <FeedbackBanner
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        visible={Boolean(feedback.message)}
      />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Cidade"
          placeholderTextColor={COLORS.textSecondary}
          value={city}
          onChangeText={setCity}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton label={loading ? 'Cadastrando...' : 'Cadastrar'} onPress={handleRegister} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem conta?</Text>
        <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
          Faça login
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    gap: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.blueAccent,
    fontWeight: '700',
    marginLeft: 6,
  },
});
