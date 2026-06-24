// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useColorScheme, Text } from 'react-native';
import { colors } from '@/core/theme';

export default function TabLayout() {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ocultamos el encabezado superior
        tabBarActiveTintColor: currentColors.brand, // Color cuando está seleccionado
        tabBarInactiveTintColor: currentColors.textSecondary, // Color cuando no está seleccionado
        tabBarStyle: {
          backgroundColor: currentColors.surface,
          borderTopColor: currentColors.border,
          elevation: 0, // Quitamos la sombra en Android para un look más limpio
          shadowOpacity: 0, // Quitamos la sombra en iOS
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis metas',
          // Aquí después agregaremos un ícono real (ej. FontAwesome)
          tabBarIcon: () => <Text>🎯</Text>, 
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configuración',
          tabBarIcon: () => <Text>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}