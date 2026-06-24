// src/components/SwitchRow.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../core/theme';

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

export const SwitchRow = ({ label, value, onValueChange }: SwitchRowProps) => {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: currentColors.textPrimary }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        // Colores del switch según el tema (el verde de la marca cuando está activo)
        trackColor={{ false: currentColors.border, true: currentColors.brand }}
        thumbColor={'#FFFFFF'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Empuja el texto a la izq. y el switch a la der.
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
  },
});