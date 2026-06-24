// app/(tabs)/index.tsx
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  useColorScheme, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '../../core/theme';
import { useAppStore } from '../../store/useAppStore';
import GoalCard from '../../components/GoalCard';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const currentColors = colors[theme];
  
  // 1. Obtenemos las metas desde nuestro estado global (Zustand)
  const goals = useAppStore((state) => state.goals);
  
  // 2. Estado local para lo que el usuario escribe en el buscador
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Optimización: Filtramos las metas solo cuando 'goals' o 'searchQuery' cambian.
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => 
      goal.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [goals, searchQuery]);

  return (
    // SafeAreaView evita que el contenido se superponga con la barra de estado (batería, hora) o el notch
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      
      {/* --- ENCABEZADO Y BUSCADOR --- */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentColors.textPrimary }]}>
          Mis metas
        </Text>
        
        <View style={[styles.searchContainer, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={[styles.searchInput, { color: currentColors.textPrimary }]}
            placeholder="Buscar metas"
            placeholderTextColor={currentColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* --- LISTA DE METAS --- */}
      <FlatList
        data={filteredGoals}
        keyExtractor={(item) => item.id}
        // renderItem se encarga de dibujar cada tarjeta individualmente
        renderItem={({ item }) => {
          // Calculamos el porcentaje para pasarlo a la tarjeta (evitando dividir por cero)
          const percentage = item.targetAmount > 0 
            ? Math.min(Math.round((item.savedAmount / item.targetAmount) * 100), 100) 
            : 0;

          return (
            <GoalCard 
              name={item.name}
              targetAmount={item.targetAmount}
              percentage={percentage}
              onPress={() => router.push(`/goal/${item.id}`)} 
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        // Lo que se muestra si no hay metas guardadas o si la búsqueda no coincide
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: currentColors.textSecondary }]}>
              {searchQuery ? 'No se encontraron metas.' : 'No tienes metas aún. ¡Empieza ahorrando!'}
            </Text>
          </View>
        )}
      />

      {/* --- BOTÓN FLOTANTE (FAB) --- */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: currentColors.primary }]}
        onPress={() => router.push('/goal/new-goal')} 
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 80, // Espacio extra al final para que el FAB no tape la última tarjeta
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24, // Distancia desde abajo
    right: 24,  // Distancia desde la derecha
    width: 60,
    height: 60,
    borderRadius: 30, // Círculo perfecto
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 34, // Centra el "+" verticalmente en Android
  },
});