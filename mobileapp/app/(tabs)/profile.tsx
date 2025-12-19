import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useApp } from '@/store/AppContext';
import { auth } from '@/lib/api';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { currentUser, setCurrentUser } = useApp();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        console.log('Profile: Loading current user...');
        const user = await auth.getCurrentUser();
        console.log('Profile: Got user:', user);
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        setSigningOut(true);
                        try {
                            await auth.signOut();
                            setCurrentUser(null);
                            router.replace('/login' as any);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sign out');
                        } finally {
                            setSigningOut(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ marginTop: 16, color: Colors.light.icon }}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                    </Text>
                </View>
                <Text style={styles.name}>
                    {currentUser?.first_name} {currentUser?.last_name}
                </Text>
                <Text style={styles.email}>{currentUser?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{currentUser?.role?.replace('_', ' ').toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{currentUser?.phone || 'Not set'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={[styles.infoValue, styles.statusActive]}>
                        {currentUser?.status?.toUpperCase()}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={loading}
            >
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: Colors.light.icon,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563EB',
    },
    infoSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.light.icon,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    statusActive: {
        color: '#10B981',
    },
    signOutButton: {
        backgroundColor: '#EF4444',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    signOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 12,
        color: Colors.light.icon,
    },
});
