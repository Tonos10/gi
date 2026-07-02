// src/components/SwitchRow.tsx
import { StyleSheet, Switch, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

interface FilaInterruptorProps {
  label: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

// Componente: FilaInterruptor - Fila con interruptor de encendido/apagado
export const FilaInterruptor = ({ label, value, onValueChange }: FilaInterruptorProps) => {
  const { current_colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: current_colors.textPrimary }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        // Colores del switch segÃºn el tema (el verde de la marca cuando estÃ¡ activo)
        trackColor={{
          false: current_colors.border,
          true: current_colors.brand,
        }}
        thumbColor={"#FFFFFF"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between", // Empuja el texto a la izq. y el switch a la der.
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
  },
});
