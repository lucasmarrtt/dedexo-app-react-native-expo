import { StyleSheet, Text, View, Pressable, ScrollView, Image } from 'react-native'; // <-- IMPORTAR Image
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const categories = [
    { id: 'ratos', label: 'Ratos', image: require('../assets/rato.png') },
    { id: 'baratas', label: 'Baratas', image: require('../assets/rato.png') },   // troque pela imagem certa
    { id: 'formigas', label: 'Formigas', image: require('../assets/rato.png') },  // troque pela imagem certa
    { id: 'cupins', label: 'Cupins', image: require('../assets/cupim.png') },
];

const ServicePage = () => {
    const router = useRouter();

    const handlePress = (category) => {
        router.push({
            pathname: '/budget-details',
            query: { category: category.id, label: category.label },
        });
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image 
                        source={require('../assets/dedexo-logo.png')}
                        style={{ 
                            width: '100%',
                            height: 24,
                            resizeMode: 'contain',
                        }}
                    />
                </View>

                <View style={styles.info}>
                    <Text>Selecione o tipo de controle</Text>
                </View>

                

                <ScrollView contentContainerStyle={styles.main} showsVerticalScrollIndicator={false}>

                    {categories.map((category) => (
                        <Pressable
                            key={category.id}
                            onPress={() => handlePress(category)}
                            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
                            style={({ pressed }) => [
                                styles.card,
                                pressed && { opacity: 0.7 },
                            ]}
                        >
                            <Image source={category.image} style={styles.cardImage} />
                            <Text style={styles.cardText}>{category.label}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default ServicePage;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f6f5f3',
    },

    container: {
        flex: 1,
        
    },

    header: {
        backgroundColor: '#fff',
        borderRadius: 8,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        
    },

    info: {
        marginBottom: 32,
        alignItems: 'center',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    main: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 16,
        gap: 8,
        paddingHorizontal: 16,
    },

    card: {
        width: 172,
        height: 240,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
    },

    cardImage: {
        width: 100,
        height: 100,
        marginBottom: 16,
        resizeMode: 'contain',
    },

    cardText: {
        color: 'black', // <-- branco não aparecia no fundo branco
        fontWeight: 'bold',
        fontSize: 16,
    },
});
