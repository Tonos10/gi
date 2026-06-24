import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../core/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'brand';
  disabled?: boolean;
}

export const Button = ({ title, onPress, variant = 'brand', disabled = false }: Props) => {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];

  const getBackgroundColor = () => {
    if (disabled) return currentColors.border;
    switch (variant) {
      case 'primary':
        return currentColors.primary;
      case 'danger':
        return currentColors.danger;
      case 'brand':
      default:
        return currentColors.brand;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
