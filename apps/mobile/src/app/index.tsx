import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { can, login, logout, restoreSession, type MobileUser } from '../lib/api';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [user, setUser] = useState<MobileUser | null>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    restoreSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setRestoring(false));
  }, []);

  const modules = useMemo(() => {
    if (!user) return [];
    const candidates = [
      ['Usuarios', 'users.read'], ['Empresas', 'companies.read'], ['Operaciones', 'products.read'],
      ['Comercial', 'sales.read'], ['Reportes', 'reports.read'], ['CRM', 'crm.read'], ['Analítica', 'reports.read'],
    ] as const;
    return candidates.filter(([, permission]) => can(user, permission)).map(([name]) => name);
  }, [user]);

  const handleLogin = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setMessage('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setMessage('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      setUser(await login(normalizedEmail, password));
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  if (restoring) {
    return <View style={[styles.screen, styles.centered]}><StatusBar style="light" /><ActivityIndicator size="large" /><Text style={styles.loadingText}>Restaurando sesión segura…</Text></View>;
  }

  if (user) {
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.dashboardContent}>
          <Text style={styles.product}>JAFORA ERP MOBILE</Text>
          <Text style={styles.dashboardTitle}>Hola, {displayName}</Text>
          <Text style={styles.dashboardSubtitle}>{user.email}</Text>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>SESIÓN ACTIVA</Text>
            <Text style={styles.title}>Tu espacio de trabajo</Text>
            <Text style={styles.description}>Módulos disponibles según tus permisos actuales.</Text>
            <View style={styles.moduleGrid}>{modules.map((module) => <View key={module} style={styles.moduleChip}><Text style={styles.moduleText}>{module}</Text></View>)}</View>
            {modules.length === 0 ? <Text style={styles.messageText}>Tu cuenta no tiene módulos móviles disponibles todavía.</Text> : null}
            <Pressable style={styles.logoutButton} onPress={async () => { setLoading(true); await logout(); setUser(null); setLoading(false); }} disabled={loading}>
              <Text style={styles.logoutText}>{loading ? 'Cerrando…' : 'Cerrar sesión'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandSection}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>J</Text>
          </View>
          <Text style={styles.brand}>JAFORA</Text>
          <Text style={styles.product}>ERP MOBILE</Text>
          <Text style={styles.brandSubtitle}>
            Gestión empresarial simple, segura y en movimiento.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>ACCESO SEGURO</Text>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.description}>
            Ingresa tus credenciales para acceder a tu espacio de trabajo.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setMessage('');
              }}
              placeholder="nombre@empresa.com"
              placeholderTextColor="#8B96A8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordField}>
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setMessage('');
                }}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#8B96A8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                onPress={() => setShowPassword((current) => !current)}
                style={styles.passwordAction}
              >
                <Text style={styles.passwordActionText}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              </Pressable>
            </View>
          </View>

          {message ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
            ]}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Ingresando…' : 'Iniciar sesión'}</Text>
          </Pressable>

          <View style={styles.securityRow}>
            <View style={styles.securityDot} />
            <Text style={styles.securityText}>
              Tus credenciales se enviarán únicamente a la API de JAFORA.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>JAFORA ERP · React Native + Expo</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { color: '#C8D3E5', marginTop: 14, fontSize: 14 },
  dashboardContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 70, paddingBottom: 32 },
  dashboardTitle: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 12 },
  dashboardSubtitle: { color: '#C8D3E5', fontSize: 14, marginTop: 6, marginBottom: 28 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  moduleChip: { backgroundColor: '#EEF5FF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 },
  moduleText: { color: '#1457A6', fontWeight: '800', fontSize: 13 },
  logoutButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D8E0EA', borderRadius: 15, marginTop: 8 },
  logoutText: { color: '#26344E', fontWeight: '800', fontSize: 14 },
  screen: {
    flex: 1,
    backgroundColor: '#101C35',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1677FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 5,
  },
  product: {
    color: '#19C6C2',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 5,
  },
  brandSubtitle: {
    color: '#C8D3E5',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 300,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
  },
  eyebrow: {
    color: '#1677FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: '#101C35',
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
  },
  description: {
    color: '#657185',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 22,
  },
  fieldGroup: {
    marginBottom: 17,
  },
  label: {
    color: '#26344E',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    borderRadius: 14,
    paddingHorizontal: 15,
    color: '#101C35',
    backgroundColor: '#F8FAFC',
    fontSize: 15,
  },
  passwordField: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  passwordInput: {
    flex: 1,
    minHeight: 50,
    paddingLeft: 15,
    paddingRight: 8,
    color: '#101C35',
    fontSize: 15,
  },
  passwordAction: {
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  passwordActionText: {
    color: '#1677FF',
    fontSize: 12,
    fontWeight: '800',
  },
  messageBox: {
    backgroundColor: '#F2F6FA',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 15,
  },
  messageText: {
    color: '#4B5A70',
    fontSize: 12,
    lineHeight: 18,
  },
  loginButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1677FF',
    borderRadius: 15,
  },
  loginButtonPressed: {
    opacity: 0.86,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
  },
  securityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#19C6C2',
    marginTop: 5,
    marginRight: 9,
  },
  securityText: {
    flex: 1,
    color: '#718096',
    fontSize: 11,
    lineHeight: 17,
  },
  footer: {
    color: '#8290A8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 22,
  },
});
