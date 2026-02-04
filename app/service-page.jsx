import { StyleSheet, Text, View, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const categories = [
  { id: 'ratos', label: 'Ratos', price: 240, image: require('../assets/rato.png') },
  { id: 'barata_grande', label: 'Baratas', price: 180, image: require('../assets/rato.png') },
  { id: 'formigas', label: 'Formigas', price: 140, image: require('../assets/rato.png') },
  { id: 'cupins', label: 'Cupins', price: 25, perMeter: true, image: require('../assets/rato.png') },
];

const ServicePage = () => {
  const router = useRouter();

  const handlePress = (category) => {
    router.push({
      pathname: '/budget-details',
      params: { // Use params em vez de query dependendo da versão do expo-router, mas o budget-details lerá corretamente
        label: category.label,
        price: category.price,
        perMeter: String(category.perMeter || false),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/dedexo-logo.png')}
            style={{ width: '100%', height: 24, resizeMode: 'contain' }}
          />
        </View>

        <View style={styles.info}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Selecione o tipo de controle</Text>
        </View>

        <ScrollView contentContainerStyle={styles.main} showsVerticalScrollIndicator={false}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => handlePress(category)}
              android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            >
              <Image source={category.image} style={styles.cardImage} />
              <Text style={styles.cardText}>{category.label}</Text>
              <Text style={styles.price}>
                R$ {category.price}{category.perMeter ? '/m²' : ''}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ServicePage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f5f3' },
  container: { flex: 1 },
  header: { backgroundColor: '#fff', borderRadius: 8, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  info: { marginBottom: 32, alignItems: 'center' },
  main: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  card: { width: '47%', height: 220, backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4 },
  cardImage: { width: 80, height: 80, marginBottom: 12, resizeMode: 'contain' },
  cardText: { fontWeight: 'bold', fontSize: 16 },
  price: { marginTop: 6, color: '#2e7d32', fontWeight: '700' },
});