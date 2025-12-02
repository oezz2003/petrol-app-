import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '@/store/AppContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
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
              gestureEnabled: false, // Prevent swipe to dismiss
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
