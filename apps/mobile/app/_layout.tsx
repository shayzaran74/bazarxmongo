// apps/mobile/app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import 'react-native-reanimated'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = { initialRouteName: '(tabs)' }

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  useEffect(() => { if (error) throw error }, [error])
  useEffect(() => { if (loaded) SplashScreen.hideAsync() }, [loaded])

  if (!loaded) return null
  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/*
        expo-router, app/ altındaki tüm dosyaları otomatik route olarak tanır.
        Burada sadece özel seçenek gerektiren ekranlar tanımlanır.
      */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
      </Stack>
    </ThemeProvider>
  )
}
