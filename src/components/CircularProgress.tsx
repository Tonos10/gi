import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../core/theme';

interface Props {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const CircularProgress = ({ 
  percentage, 
  size = 200, 
  strokeWidth = 20,
  label 
}: Props) => {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];
  
  // Lógica matemática
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Calculamos cuánto del trazo se oculta. 
  // Si percentage es 100, strokeDashoffset es 0 (se ve todo el círculo).
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Círculo de fondo (Gris/Borde) */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={currentColors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Círculo de progreso (Verde/Marca) */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={currentColors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      
      {/* Texto central */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.textContainer}>
          <Text style={[styles.percentageText, { color: currentColors.textPrimary }]}>
            {percentage}%
          </Text>
          {label && (
            <Text style={[styles.label, { color: currentColors.textSecondary }]}>
              {label}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  textContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  percentageText: { fontSize: 32, fontWeight: 'bold' },
  label: { fontSize: 14, marginTop: 4 },
});