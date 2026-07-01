import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
//import { LinearGradient } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "../store/useAppStore";
interface GlassTransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: "deposit" | "withdraw";
  goalId: string; // Necesario para asociar la transacción a un ahorro específico
  title?: string;
  subtitle?: string;
}

export const GlassTransactionModal: React.FC<GlassTransactionModalProps> = ({
  isVisible,
  onClose,
  type,
  goalId,
  title,
  subtitle,
}) => {
  const [renderModal, setRenderModal] = useState(isVisible);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const addTransaction = useAppStore((state) => state.addTransaction);
  const goal = useAppStore((state) => state.goals.find((g) => g.id === goalId));
  const currencySymbol = useAppStore((state) => state.settings.currencySymbol);

  // Reanimated shared values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const translateY = useSharedValue(20);

  useEffect(() => {
    let animationFrame: number | null = null;

    if (isVisible) {
      animationFrame = requestAnimationFrame(() => {
        setRenderModal(true);
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withTiming(1, { duration: 300 });
        translateY.value = withTiming(0, { duration: 300 });
      });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      scale.value = withTiming(0.92, { duration: 250 });
      translateY.value = withTiming(20, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setRenderModal)(false);
        }
      });
    }

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, opacity, scale, translateY]); // <-- Dependencias agregadas aquí

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Por favor, ingresa una cantidad válida mayor a 0.");
      return;
    }

    if (type === "withdraw" && goal && numericAmount > goal.savedAmount) {
      alert(
        `No puedes retirar más de lo que tienes ahorrado (${currencySymbol}${goal.savedAmount.toLocaleString(
          "es-MX",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )}).`,
      );
      return;
    }

    // Despachar la acción a Zustand
    addTransaction({
      id: Date.now().toString(),
      goalId,
      amount: numericAmount,
      type: type === "deposit" ? "deposit" : "withdrawal",
      note: note.trim() || undefined,
      date: new Date().toISOString(),
    });

    // Limpiar inputs y cerrar
    setAmount("");
    setNote("");
    handleClose();
  };

  void handleSave;

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  if (!renderModal) return null;

  return (
    <Modal transparent visible={renderModal} animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.panelShadow, animatedStyle]}>
              <View style={styles.outerBorder}>
                <BlurView
                  intensity={95}
                  tint="systemMaterial"
                  style={styles.blurPanel}
                >
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,.22)",
                      "rgba(255,255,255,.08)",
                      "rgba(255,255,255,.15)",
                    ]}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* Todo el contenido */}
                </BlurView>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(20,20,20,0.18)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  panelShadow: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 34,
    shadowColor: "#fff",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  outerBorder: {
    borderRadius: 34,
    overflow: "hidden",
  },
  panelContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 34,
    // Soft white glow shadow para iOS/Android
    shadowColor: "#fff",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  blurPanel: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    padding: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  headerButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGlass: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.35)",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  titleContainer: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8, // Alinear un poco con los botones
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  inputContainer: {
    gap: 20,
    marginBottom: 10,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  glassInput: {
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 22,
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    color: "#fff",
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontWeight: "600",
  },
});
