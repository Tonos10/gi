import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { colors } from '../core/theme'; // Importamos nuestro diccionario

interface GoalCardProps {
  name: string;
  targetAmount: number;
  percentage: number;
  onPress: () => void;
}

const GoalCard = memo(({ name, targetAmount, percentage, onPress }: GoalCardProps) => {
  // 1. EL ESPÍA: Le preguntamos al celular en qué modo está. 
  // Si por alguna razón falla, asumimos 'light' por defecto.
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light'; 
  
  // 2. LA PALETA: Seleccionamos el diccionario correcto (light o dark)
  const currentColors = colors[theme]; 

  return (
    <TouchableOpacity 
      // 3. APLICACIÓN DINÁMICA: Mezclamos los estilos estáticos (márgenes, tamaños) 
      // con los colores dinámicos.
      style={[styles.cardContainer, { backgroundColor: currentColors.surface }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: currentColors.iconBackground }]}>
        <Text style={styles.iconPlaceholder}>🐷</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.goalName, { color: currentColors.textPrimary }]}>{name}</Text>
        
        <Text style={[styles.progressText, { color: currentColors.textSecondary }]}>
          {percentage}% de ${targetAmount.toLocaleString()} ahorrado
        </Text>

        <View style={[styles.progressBarBackground, { backgroundColor: currentColors.border }]}>
          <View style={[
            styles.progressBarFill, 
            { width: `${percentage}%`, backgroundColor: currentColors.brand }
          ]} />
        </View>
      </View>
      
      <Text style={[styles.chevron, { color: currentColors.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );
});

GoalCard.displayName = 'GoalCard';

// Los estilos estáticos (cosas que no cambian de color, como la forma o el tamaño)
const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconPlaceholder: { fontSize: 24 },
  infoContainer: { flex: 1 },
  goalName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  progressText: { fontSize: 12, marginBottom: 8 },
  progressBarBackground: { height: 4, borderRadius: 2, width: '100%' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  chevron: { fontSize: 20, marginLeft: 12 },
});

export default GoalCard;