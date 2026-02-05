import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import haversine from 'haversine';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const CENTER = { latitude: -16.0859, longitude: -48.5136 };
const RADIUS_KM = 50;
const PRICE_PER_KM = 1.8;

// fatores conforme slider: baixa (0), média (1), alta (2)
const infestationFactor = [0.85, 1.0, 1.35];

const BudgetDetailsPage = () => {
  const router = useRouter();
  const rawParams = useLocalSearchParams();

  const label = rawParams.label;
  const price = Number(rawParams.price);
  const perMeter = rawParams.perMeter === 'true';

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [distance, setDistance] = useState(null);

  // Estados que controlam o cálculo dinâmico
  const [area, setArea] = useState(0);
  const [level, setLevel] = useState(1); // Default: Média

  const levelLabel = ['Baixa', 'Média', 'Alta'][level];

  // ---------------- ENDEREÇO ----------------

  const fetchSuggestions = async (input) => {
    setQuery(input);
    if (!input) return setSuggestions([]);

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          input
        )}&lat=${CENTER.latitude}&lon=${CENTER.longitude}&limit=10`
      );

      const data = await res.json();

      const filtered = data.features
        .map((f) => ({
          coords: {
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
          },
          display_name: `${f.properties.name || ''}, ${f.properties.city || ''}`,
        }))
        .filter((f) => haversine(CENTER, f.coords, { unit: 'km' }) <= RADIUS_KM);

      setSuggestions(filtered);
    } catch {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (place) => {
    setSelectedAddress(place);
    setSuggestions([]);
    setDistance(haversine(CENTER, place.coords, { unit: 'km' }));
  };

  const useCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const loc = await Location.getCurrentPositionAsync({});

    const place = {
      display_name: 'Minha localização atual',
      coords: {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      },
    };

    setSelectedAddress(place);
    setSuggestions([]);
    setDistance(haversine(CENTER, place.coords, { unit: 'km' }));
  };

  // ---------------- CÁLCULO DINÂMICO ----------------

  const calculateServicePrice = () => {
    if (!area || area <= 0) return 0;

    // Lógica para Cupins (Preço por m²)
    if (perMeter) {
      return area * price * infestationFactor[level];
    }

    // Lógica para Ratos, Baratas, Formigas (Preço Base + Extra por área)
    let base = price * infestationFactor[level];
    let extra = 0;

    if (area > 60) {
      const extraArea = area - 60;
      // Adiciona R$ 30 a cada 50m² adicionais
      const blocks = Math.ceil(extraArea / 50);
      extra = blocks * 30;
    }

    return base + extra;
  };

  // Valores calculados em tempo real durante o render
  const serviceValue = calculateServicePrice();
  const travelCost = distance ? distance * PRICE_PER_KM : 0;
  const total = serviceValue + travelCost;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>

          <Image
            source={require('../assets/dedexo-logo.png')}
            style={styles.logo}
          />
        </View>

        {/* PRAGA SELECIONADA */}
        <View style={styles.pragaBox}>
          <Text style={styles.praga}>{label}</Text>
          <Text style={styles.base}>
            Preço base: R$ {price} {perMeter ? '/ m²' : ''}
          </Text>
        </View>

        {/* ENDEREÇO */}
        <View style={styles.addressBox}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite seu endereço"
              value={query}
              onChangeText={fetchSuggestions}
            />

            <Pressable style={styles.iconButton} onPress={useCurrentLocation}>
              <Ionicons name="locate-outline" size={22} color="#000" />
            </Pressable>
          </View>

          {suggestions.length > 0 && (
            <View style={styles.suggestionsOverlay}>
              <FlatList
                data={suggestions}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestion}
                    onPress={() => selectSuggestion(item)}
                  >
                    <Text>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* SLIDERS */}
        <View style={styles.slidersBox}>

          <Text style={styles.label}>Área: {area} m²</Text>

          <Slider
            minimumValue={0}
            maximumValue={1000}
            step={10}
            value={area}
            onValueChange={(val) => setArea(val)} // Atualiza o estado em tempo real
            minimumTrackTintColor="#7ed957"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#000"
            style={{ width: '100%', height: 40, transform: [{ scaleX: 1.06 }, ], }}
          />

          <Text style={styles.label}>Infestação: {levelLabel}</Text>

          <Slider
            minimumValue={0}
            maximumValue={2}
            step={1}
            value={level}
            onValueChange={(val) => setLevel(val)} // Atualiza o estado em tempo real
            minimumTrackTintColor="#7ed957"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#000"
            style={{ width: '100%', height: 40, transform: [{ scaleX: 1.06 }, ],}}
          />
        </View>

        {/* RESUMO */}
        {selectedAddress && (
          <View style={styles.summary}>
            <Text>Distância: {distance.toFixed(2)} km</Text>
            <Text>Locomoção: R$ {travelCost.toFixed(2)}</Text>
            <Text>Serviço ({label}): R$ {serviceValue.toFixed(2)}</Text>

            <Text style={styles.total}>
              VALOR TOTAL: R$ {total.toFixed(2)}
            </Text>
          </View>
        )}

        {/* BOTÃO */}
        <Pressable
          style={styles.button}
          onPress={() => router.push({
            pathname: '/finalized-budget',
            params: {
              label,
              price: serviceValue.toFixed(2),
              travel: travelCost.toFixed(2),
              total: total.toFixed(2),
              area,
              level: levelLabel,
              address: selectedAddress.display_name,
            }
          })}
        >
          <Text style={styles.buttonText}>FINALIZAR</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
};

export default BudgetDetailsPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f5f3' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  backButton: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#f6f5f3', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 140, height: 24, resizeMode: 'contain' },
  pragaBox: { alignItems: 'center', marginVertical: 12 },
  praga: { fontSize: 22, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2, },
  base: { color: '#2e7d32', fontWeight: '600' },
  addressBox: { paddingHorizontal: 16, marginBottom: 16, },
  inputContainer: { flexDirection: 'row' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  iconButton: { marginLeft: 8, width: 48, borderRadius: 8, backgroundColor: '#7ed957', alignItems: 'center', justifyContent: 'center' },
  suggestionsOverlay: { backgroundColor: '#fff', borderRadius: 8, marginTop: 4, maxHeight: 220, elevation: 3, zIndex: 10 },
  suggestion: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  slidersBox: { paddingHorizontal: 16, marginTop: 16, marginBottom: 32, flex: 1 },
  label: { marginTop: 12, fontWeight: '600' },
  summary: { margin: 16, padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  total: { marginTop: 10, fontSize: 20, fontWeight: '900' },
  button: { marginHorizontal: 16, padding: 16, borderRadius: 8, backgroundColor: '#7ed957', alignItems: 'center', marginBottom: 20 },
  buttonText: { fontWeight: '800', fontSize: 16, letterSpacing: 2, },
});