import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.hero}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>J</Text>
        </View>
        <Text style={styles.brand}>JAFORA</Text>
        <Text style={styles.product}>ERP MOBILE</Text>
        <Text style={styles.subtitle}>
          Gestiona tu empresa desde cualquier lugar.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>BASE MÓVIL</Text>
        <Text style={styles.cardTitle}>Todo tu negocio, en una sola vista.</Text>
        <Text style={styles.cardText}>
          Esta es la base inicial de la aplicación móvil de JAFORA. Aquí
          integraremos acceso seguro, panel principal y los módulos del ERP.
        </Text>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Aplicación móvil preparada</Text>
        </View>
      </View>

      <Text style={styles.footer}>JAFORA ERP · React Native + Expo</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101C35',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 44,
  },
  brandMark: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#1677FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 5,
  },
  product: {
    color: '#19C6C2',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 6,
  },
  subtitle: {
    color: '#C8D3E5',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 18,
    maxWidth: 300,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
  },
  cardEyebrow: {
    color: '#1677FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#101C35',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  cardText: {
    color: '#5D687A',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: '#F2F6FA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#19C6C2',
    marginRight: 10,
  },
  statusText: {
    color: '#101C35',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    color: '#8290A8',
    fontSize: 12,
    textAlign: 'center',
  },
});
