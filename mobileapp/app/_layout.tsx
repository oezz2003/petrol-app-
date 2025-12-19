import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider, useApp } from '@/store/AppContext';
import { auth } from '@/lib/api';

// Roles that can access the mobile app
const MOBILE_ALLOWED_ROLES = ['engineer', 'manager', 'field_engineer', 'hse_officer'];

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const { setCurrentUser } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();

    // Listen to auth state changes
    const { data: authListener } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Directly load user data instead of calling checkAuth to avoid loops
        const user = await auth.getCurrentUser();
        if (user && !MOBILE_ALLOWED_ROLES.includes(user.role)) {
          // User is not allowed to access mobile app
          setAccessDenied(true);
          setCurrentUserRole(user.role);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
          setAccessDenied(false);
          if (user) {
            setCurrentUser(user);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setAccessDenied(false);
        setCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const user = await auth.getCurrentUser();
    if (user) {
      if (!MOBILE_ALLOWED_ROLES.includes(user.role)) {
        // User is not allowed to access mobile app
        setAccessDenied(true);
        setCurrentUserRole(user.role);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setAccessDenied(false);
        setCurrentUser(user);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setAccessDenied(false);
    setCurrentUserRole(null);
    router.replace('/login' as any);
  };

  useEffect(() => {
    if (isAuthenticated === null) return; // Still checking

    const inAuthGroup = String(segments[0]) === 'login';

    if (!isAuthenticated && !inAuthGroup && !accessDenied) {
      // User is not signed in and not on login page, redirect to login
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // User is signed in but on login page, redirect to tabs
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, segments, accessDenied]);

  // Show loading screen while checking auth
  if (isAuthenticated === null && !accessDenied) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Show access denied screen for dashboard users
  if (accessDenied) {
    return (
      <View style={styles.accessDeniedContainer}>
        <View style={styles.accessDeniedCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🚫</Text>
          </View>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedMessage}>
            Your account role ({currentUserRole}) does not have access to the mobile app.
            Please use the dashboard instead.
          </Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out & Return to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="operations/new-well"
          options={{
            title: 'New Well',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="hse/new-hazard"
          options={{
            title: 'New Hazard',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="hse/[id]"
          options={{
            title: 'Hazard Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="hse/task/[id]"
          options={{
            title: 'Task Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="daily-report-modal"
          options={{
            presentation: 'modal',
            title: 'Daily Report',
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 24,
  },
  accessDeniedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  accessDeniedMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

