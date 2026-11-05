import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import FeedbackBanner from '../../components/FeedbackBanner';
import PrimaryButton from '../../components/PrimaryButton';
import ScreenContainer from '../../components/ScreenContainer';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', title: '', message: '' });
  const { setUser, setToken } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = 'Preencha seu e-mail e senha para continuar.';
      setFeedback({ type: 'error', title: 'Campos obrigatórios', message: msg });
      Alert.alert('Atenção', msg);
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: 'info', title: 'Conectando', message: 'Validando seus dados...' });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Erro ao fazer login.');
      }

      setUser(data.user);
      setToken(data.token);
      setFeedback({
        type: 'success',
        title: 'Login realizado',
        message: `Bem-vindo(a), ${data.user.name}!`,
      });
      Alert.alert('Sucesso', `Login realizado com sucesso. Bem-vindo(a), ${data.user.name}!`);
      navigation.navigate('AppTabs');
    } catch (error) {
      const message = error.message || 'Não foi possível entrar agora.';
      setFeedback({ type: 'error', title: 'Não foi possível entrar', message });
      Alert.alert('Erro no login', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entre para continuar sua jornada de eventos.</Text>
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

        <PrimaryButton label={loading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta?</Text>
        <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
          Cadastre-se
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
