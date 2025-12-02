import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>User profile and settings coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.icon,
        textAlign: 'center',
    },
});
