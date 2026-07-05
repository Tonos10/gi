import { BlurView } from "expo-blur";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface withdraw_modal_props {
  is_visible: boolean;
  on_close: () => void;
  on_save?: (amount: number, note: string) => void;
  available_amount?: string;
}

// Componente: ModalRetiro - Modal para retirar dinero
export default function ModalRetiro({
  is_visible,
  on_close,
  on_save,
  available_amount,
}: withdraw_modal_props) {
  const [withdraw_amount, set_withdraw_amount] = useState("");
  const [withdraw_note, set_withdraw_note] = useState("");

  const handle_withdraw = () => {
    if (on_save) {
      on_save(parseFloat(withdraw_amount), withdraw_note);
    } else {
      on_close();
    }
  };

  return (
    <Modal visible={is_visible} transparent={true} animationType="slide">
      <KeyboardAvoidingView
        style={styles.modal_overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <BlurView intensity={70} tint="dark" style={styles.glass_panel}>
          <Text style={styles.modal_title}>Retirar dinero</Text>
          <Text style={styles.modal_subtitle}>
            {available_amount
              ? `Monto disponible: ${available_amount}`
              : "Retiro de fondos"}
          </Text>

          <TextInput
            style={styles.input_field}
            keyboardType="numeric"
            placeholder="$0.00"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={withdraw_amount}
            onChangeText={set_withdraw_amount}
          />

          <TextInput
            style={[styles.input_field, { fontSize: 16 }]}
            placeholder="Nota (opcional)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={withdraw_note}
            onChangeText={set_withdraw_note}
          />

          <View style={styles.button_container}>
            <TouchableOpacity style={styles.cancel_button} onPress={on_close}>
              <Text style={styles.cancel_text}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.action_button}
              onPress={handle_withdraw}
            >
              <BlurView intensity={40} tint="light" style={styles.action_glass}>
                <Text style={styles.action_text}>Retirar</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal_overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  glass_panel: {
    width: "85%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  modal_title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
  },
  modal_subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 24,
  },
  input_field: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    fontSize: 20,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  button_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancel_button: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  cancel_text: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    fontWeight: "600",
  },
  action_button: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  action_glass: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  action_text: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
