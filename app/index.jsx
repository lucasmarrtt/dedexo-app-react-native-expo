import { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../assets/dedexo-logo.png';

const Home = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image source={Logo} style={{ 
                            width: '100%',
                            height: 40,
                            resizeMode: 'contain',
                            marginBottom: 24,
                        }} />
          <Text style={{ fontWeight: '600', textAlign: 'center', width: 300 }}>
            Aqui você resolve seu orçamento de forma prática, sem estresse e sem perda de tempo.
          </Text>
        </View>

        <View style={styles.button}>
          <Pressable
            style={styles.startButton}
            onPress={() => router.push('/service-page')}
          >
            <Text style={styles.startButtonText}>COMEÇAR</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f5f3' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  logo: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  button: { height: 300, width: '100%', justifyContent: 'flex-start', alignItems: 'center' },
  startButton: {
    backgroundColor: '#7ed957',
    width: '100%',
    height: 66,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
});
