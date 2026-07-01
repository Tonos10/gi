// src/hooks/useBottomSheetAnimation.ts
//
// Hook de animación para el BottomSheet dinámico.
//
// ¿Por qué react-native-reanimated y NO Animated nativo?
// ─────────────────────────────────────────────────────
// - Las animaciones corren en el hilo de UI (no JS), eliminando jank.
// - `useAnimatedStyle` + `useSharedValue` permiten interpolar valores
//   en el hilo nativo sin serialización de mensajes.
// - `withTiming` con `Easing.bezier` da la sensación de un spring suave.
// - Reanimated 4.x retorna `AnimatedStyleHandle` desde useAnimatedStyle;
//   se pasa directamente al prop `style` de Animated.View (sin arrays mixtos).
//
// ¿Por qué NO Animated.event nativo con useNativeDriver?
// ──────────────────────────────────────────────────────
// - `useNativeDriver: true` no soporta animación de height/borderRadius.
// - Reanimated sí puede animar layout properties usando su propio driver.

import { useCallback, useRef } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Altura inicial del sheet: 88% de la pantalla / Initial sheet height
const INITIAL_HEIGHT = SCREEN_HEIGHT * 0.88;
const FULL_HEIGHT = SCREEN_HEIGHT;

// Radios de bordes superiores / Top border radii
const INITIAL_BORDER_RADIUS = 24;
const FULL_BORDER_RADIUS = 0;

// Umbral de scroll para disparar la transición / Scroll threshold for transition
const SCROLL_THRESHOLD = 20;

// Configuración de timing compartida / Shared timing config
const TIMING_CONFIG = {
  duration: 280,
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
} as const;

export interface UseBottomSheetAnimationReturn {
  /** Valor compartido (0 = parcial, 1 = fullscreen) */
  progress: ReturnType<typeof useSharedValue<number>>;
  /**
   * Estilo animado del contenedor del sheet.
   * Incluye: height + borderTopLeftRadius + borderTopRightRadius.
   * Pasar directamente al prop `style` de Animated.View (sin array mixto).
   */
  containerAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  /**
   * Estilo animado del drag handle (opacity 1→0 al expandirse).
   * Pasar directamente al prop `style` de Animated.View (sin array mixto).
   */
  handleAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  /** Handler para el prop `onScroll` del ScrollView */
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function useBottomSheetAnimation(): UseBottomSheetAnimationReturn {
  const progress = useSharedValue(0);
  const is_fullscreen = useRef(false);

  // ── Estilo animado del contenedor principal ────────────────────────────────
  // Reanimated 4: useAnimatedStyle retorna AnimatedStyleHandle, no ViewStyle.
  // Pasar directamente a Animated.View style={containerAnimatedStyle} — no en array.
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [INITIAL_HEIGHT, FULL_HEIGHT]),
    borderTopLeftRadius: interpolate(
      progress.value,
      [0, 1],
      [INITIAL_BORDER_RADIUS, FULL_BORDER_RADIUS],
    ),
    borderTopRightRadius: interpolate(
      progress.value,
      [0, 1],
      [INITIAL_BORDER_RADIUS, FULL_BORDER_RADIUS],
    ),
  }));

  // ── Estilo animado del drag handle ─────────────────────────────────────────
  const handleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5], [1, 0]),
  }));

  // ── Handler de scroll / Scroll event handler ───────────────────────────────
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset_y = event.nativeEvent.contentOffset.y;

      if (offset_y > SCROLL_THRESHOLD && !is_fullscreen.current) {
        // Scroll hacia abajo → expandir / Scroll down → expand to fullscreen
        is_fullscreen.current = true;
        progress.value = withTiming(1, TIMING_CONFIG);
      } else if (offset_y <= 0 && is_fullscreen.current) {
        // Scroll hasta arriba → colapsar / Scroll to top → collapse back
        is_fullscreen.current = false;
        progress.value = withTiming(0, TIMING_CONFIG);
      }
    },
    [progress],
  );

  return {
    progress,
    containerAnimatedStyle,
    handleAnimatedStyle,
    handleScroll,
  };
}
