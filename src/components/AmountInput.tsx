import React from 'react';
import { View, TextInput, StyleSheet, Text, useColorScheme } from 'react-native';
import { colors } from '../core/theme';
import { useAppStore } from '../store/useAppStore';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const AmountInput = ({ value, onChangeText }: Props) => {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];
  const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

  return (
    <View style={[styles.container, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
      <Text style={[styles.symbol, { color: currentColors.textPrimary }]}>{currencySymbol}</Text>
      <TextInput
        style={[styles.input, { color: currentColors.textPrimary }]}
        placeholder="0"
        placeholderTextColor={currentColors.textSecondary}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 20,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    height: '100%',
  },
});
