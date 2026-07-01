import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface GlassCardProps {
  label: string;
  amount: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ label, amount }) => {
  return (
    <View style={styles.availableCard}>
      <Text style={styles.availableLabel}>{label}</Text>
      <Text style={styles.availableAmount}>{amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  availableCard: {
    backgroundColor: "rgba(255,255,255,.18)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.45)",
    marginBottom: 22,
  },
  availableLabel: {
    color: "rgba(255,255,255,.28)",
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  availableAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  }
});
