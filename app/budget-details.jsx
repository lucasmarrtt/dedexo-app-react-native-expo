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
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import haversine from 'haversine';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const CENTER = { latitude: -16.0859, longitude: -48.5136 };
const RADIUS_KM = 50;
const PRICE_PER_KM = 1.8;

const BudgetDetailsPage = () => {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [distance, setDistance] = useState(null);

  const [area, setArea] = useState(0);
  const [level, setLevel] = useState(1);

  const levelLabel = ['Baixa', 'Média', 'Alta'][level];

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
          display_name: `${f.properties.name || ''}, ${f.properties.city || ''}, ${f.properties.country || ''}`,
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

        {/* ENDEREÇO + OVERLAY */}
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
            maximumValue={5000}
            step={10}
            value={area}
            onValueChange={setArea}
            minimumTrackTintColor="#7ed957"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#000"
    
          />

          <Text style={styles.label}>Infestação: {levelLabel}</Text>

          <Slider
            minimumValue={0}
            maximumValue={2}
            step={1}
            value={level}
            onValueChange={setLevel}
            minimumTrackTintColor="#7ed957"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#000"
          />

        </View>

        {/* RESUMO */}
        {selectedAddress && (
          <View style={styles.summary}>
            <Text>Endereço: {selectedAddress.display_name}</Text>
            <Text>Distância: {distance?.toFixed(2)} km</Text>
            <Text>Locomoção: R$ {(distance * PRICE_PER_KM).toFixed(2)}</Text>
          </View>
        )}

        {/* CONTINUAR */}
        {selectedAddress && (
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>CONTINUAR</Text>
          </Pressable>
        )}

      </View>
    </SafeAreaView>
  );
};

export default BudgetDetailsPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f5f3' },
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f5f3',
  },

  logo: {
    width: 140,
    height: 24,
    resizeMode: 'contain',
  },

  addressBox: {
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    height: 48,
  },

  iconButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#7ed957',
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestionsOverlay: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 220,
    overflow: 'hidden',
    elevation: 4,
  },

  suggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  slidersBox: {
    paddingHorizontal: 16,
    marginTop: 16,
  },




  label: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
  },

  summary: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },

  button: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 32,
    backgroundColor: '#7ed957',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '900',
  },
});
