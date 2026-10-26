import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
} from '@expo-google-fonts/ubuntu';
import { useTheme, useThemeColors } from '../lib/theme';
import { Toast } from '../components/Toast';
import { useSession } from '../lib/session';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useThemeColors();
  const theme = useTheme();
  const hydrate = useSession(s => s.hydrate);
  const isWeb = Platform.OS === 'web';

  useEffect(() => { void hydrate(); }, [hydrate]);

  const [fontsLoaded] = useFonts({
    Ubuntu_400Regular, Ubuntu_500Medium, Ubuntu_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: isWeb ? '#DFE8F6' : colors.void, alignItems: 'stretch' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: isWeb ? 430 : undefined, alignSelf: 'center', backgroundColor: colors.void, overflow: 'hidden', ...(isWeb ? { shadowColor: '#102758', shadowOpacity: 0.16, shadowRadius: 24, elevation: 8 } : {}) }}>
      <StatusBar style={'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.void },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="blocked" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="link-phone" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="eligibility" />
        <Stack.Screen name="admission-status" />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: 'fade', headerShown: false }}
        />
        <Stack.Screen name="profile/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <Toast />
      </View>
    </GestureHandlerRootView>
  );
}
