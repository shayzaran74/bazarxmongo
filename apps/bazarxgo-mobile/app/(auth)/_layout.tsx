import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/auth';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Zaten giriş yapmışsa tab'lara yönlendir
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
