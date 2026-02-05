import { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const FinalizedBudget = () => {
  const params = useLocalSearchParams();
  let pdfUri = '';

  const generateAndSharePDF = async () => {
    const html = `
      <h1>Orçamento Dedexo</h1>
      <p><b>Praga:</b> ${params.label}</p>
      <p><b>Área:</b> ${params.area} m²</p>
      <p><b>Infestação:</b> ${params.level}</p>
      <p><b>Endereço:</b> ${params.address}</p>
      <p><b>Serviço:</b> R$ ${params.price}</p>
      <p><b>Locomoção:</b> R$ ${params.travel}</p>
      <h2>Total: R$ ${params.total}</h2>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    pdfUri = uri;
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Orçamento Finalizado</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={generateAndSharePDF}
          activeOpacity={1}  // Desativa a animação de opacidade para evitar o crash
        >
          <Text style={styles.buttonText}>Gerar e Compartilhar PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FinalizedBudget;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f5f3' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  button: { backgroundColor: '#25D366', padding: 16, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
});