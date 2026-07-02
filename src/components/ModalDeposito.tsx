/*import { BlurView } from "expo-blur";
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

interface deposit_modal_props {
  is_visible: boolean;
  on_close: () => void;
  on_save?: (amount: number, note: string) => void;
}

export default // Componente: ModalDeposito - Modal para depositar dinero
unction ModalDeposito({
  is_visible,
  on_close,
  on_save,
}: deposit_modal_props) {
  const [deposit_amount, set_deposit_amount] = useState("");
  const [deposit_note, set_deposit_note] = useState("");

  const handle_deposit = () => {
    if (on_save) {
      on_save(parseFloat(deposit_amount), deposit_note);
    } else {
      on_close();
    }
  };

  return (
    <Modal visible={is_visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView
        style={styles.modal_overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <BlurView intensity={70} tint="dark" style={styles.glass_panel}>
          <Text style={styles.modal_title}>Depósitos</Text>
          <Text style={styles.modal_subtitle}>
            Ingresa el monto a depositar
          </Text>

          <TextInput
            style={styles.input_field}
            keyboardType="numeric"
            placeholder="$0.00"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={deposit_amount}
            onChangeText={set_deposit_amount}
          />

          <TextInput
            style={[styles.input_field, { fontSize: 16 }]}
            placeholder="Nota (opcional)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={deposit_note}
            onChangeText={set_deposit_note}
          />

          <View style={styles.button_container}>
            <TouchableOpacity style={styles.cancel_button} onPress={on_close}>
              <Text style={styles.cancel_text}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.action_button}
              onPress={handle_deposit}
            >
              <BlurView intensity={40} tint="light" style={styles.action_glass}>
                <Text style={styles.action_text}>Depositar</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.83)",
  },
  modal_title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  modal_subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 24,
  },
  input_field: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    fontSize: 20,
    color: "#000000",
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
*/
