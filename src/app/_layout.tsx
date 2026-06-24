import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colors } from '@/core/theme';

export default function RootLayout() {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];

  return (
    <Stack
      screenOptions={{
        // Color de fondo general para todas las pantallas
        contentStyle: { backgroundColor: currentColors.background },
        // Ocultamos el header por defecto para personalizarlo nosotros
        headerShown: false, 
      }}
    >
      {/* Nuestro grupo de pestañas (Tabs) será la pantalla principal */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Aquí registraremos pantallas individuales después, como el detalle de la meta */}
      <Stack.Screen name="goal/[id]" />
      
      {/* Y aquí los modales que aparecen desde abajo */}
      <Stack.Screen 
        name="(modals)/add-money" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="(modals)/withdraw-money" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="(modals)/edit-goal" 
        options={{ presentation: 'modal' }} 
      />
    </Stack>
  );
}
