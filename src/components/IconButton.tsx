// src/components/IconButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, useColorScheme } from 'react-native';

const colors = {
  light: {
    primary: '#22C55E',
    danger: '#EF4444',
    brand: '#3B82F6',
    textPrimary: '#111827',
  },
  dark: {
    primary: '#22C55E',
    danger: '#EF4444',
    brand: '#60A5FA',
    textPrimary: '#F9FAFB',
  },
} as const;

interface IconButtonProps {
  label: string;
  icon: string; // Temporalmente usaremos caracteres, luego podemos poner @expo/vector-icons
  colorKey: 'primary' | 'danger' | 'brand'; // Elegimos verde, rojo o azul de nuestro theme
  onPress: () => void;
}

export const IconButton = ({ label, icon, colorKey, onPress }: IconButtonProps) => {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.circle, { backgroundColor: currentColors[colorKey] }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{icon}</Text>
      </TouchableOpacity>
      
      {/* Texto debajo del botón que cambia de color si es modo oscuro o claro */}
      <Text style={[styles.label, { color: currentColors.textPrimary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 12, // Separa los botones entre sí cuando hay varios en fila
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30, // Un borderRadius de exactamente la mitad del ancho/alto hace un círculo perfecto
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, // Espacio entre el círculo y el texto
  },
  icon: {
    fontSize: 28,
    color: '#FFFFFF', // El ícono/texto interior siempre es blanco
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
