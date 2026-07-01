// src/components/modal/ModalCard.tsx
/**
 * Arquitectura del overlay (correcta):
 *
 *  Modal
 *  └─ KeyboardAvoidingView (flex:1 = pantalla completa)
 *     └─ View overlay (flex:1, fondo oscuro, centrado)
 *         ├─ TouchableWithoutFeedback → View absoluteFill   ← solo cierra teclado
 *         └─ Animated.View card (maxHeight en px via useWindowDimensions)
 *             └─ children
 *                  Si hay ScrollView interno → debe llevar style={{ flexShrink: 1 }}
 *                  para que Yoga le quite altura cuando el contenido desborda maxHeight
 *                  y active el scroll.
 *
 * IMPORTANTE: NO se usa flex:1 en el card. maxHeight en píxeles (no %)
 * garantiza que todos los hijos (incluidos ScrollViews) puedan calcular su
 * propia altura correctamente.
 */
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "../../hooks/useAppTheme";

interface ModalCardProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  cardStyle?: ViewStyle;
}

export const ModalCard: React.FC<ModalCardProps> = ({
  isVisible,
  onClose,
  children,
  cardStyle,
}) => {
  const { current_colors } = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();

  const [renderModal, setRenderModal] = useState(isVisible);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const translateY = useSharedValue(24);

  useEffect(() => {
    if (isVisible) {
      setRenderModal(true);
      opacity.value = withTiming(1, { duration: 280 });
      scale.value = withTiming(1, { duration: 280 });
      translateY.value = withTiming(0, { duration: 280 });
    } else {
      opacity.value = withTiming(0, { duration: 220 });
      scale.value = withTiming(0.94, { duration: 220 });
      translateY.value = withTiming(24, { duration: 220 }, (finished) => {
        if (finished) runOnJS(setRenderModal)(false);
      });
    }
  }, [isVisible, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  if (!renderModal) return null;

  return (
    <Modal
      visible={renderModal}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.overlay}>

          {/* Zona de tap que SOLO cierra el teclado — no envuelve el card */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* Card — SIN flex:1. maxHeight en píxeles para que Yoga
              pueda calcular la altura de los ScrollViews internos. */}
          <Animated.View
            style={[
              styles.card,
              {
                // Usar píxeles (no %) para que los ScrollViews hijos
                // puedan calcular correctamente su propia altura con flexShrink.
                maxHeight: windowHeight * 0.88,
                backgroundColor: current_colors.surface,
                borderColor: current_colors.border,
                shadowColor: current_colors.shadow_color,
              },
              animatedStyle,
              cardStyle,
            ]}
          >
            {children}
          </Animated.View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    // SIN flex:1 — el card envuelve su contenido de forma natural
    // hasta el límite de maxHeight (calculado en píxeles arriba).
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 20,
    // Sombra iOS
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    // Sombra Android
    elevation: 16,
  },
});
