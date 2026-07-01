// src/components/modal/ModalHeader.tsx
/**
 * Layout: [Cancelar]   [Título / Subtítulo]   [Acción]
 *
 * - leftLabel  : texto del botón izquierdo  (ej. "Cancelar")
 * - rightLabel : texto del botón derecho    (ej. "Guardar")
 * - rightColor : color del botón derecho    (por defecto usa brand del tema)
 */
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  /** Texto e handler del botón izquierdo (Cancelar) */
  onLeftPress: () => void;
  leftLabel?: string;
  /** Texto e handler del botón derecho (Guardar / Confirmar) */
  onRightPress: () => void;
  rightLabel?: string;
  /** Color personalizado para el botón derecho */
  rightColor?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  onLeftPress,
  leftLabel = "Cancelar",
  onRightPress,
  rightLabel = "Guardar",
  rightColor,
}) => {
  const { current_colors } = useAppTheme();
  const actionColor = rightColor ?? current_colors.brand;

  return (
    <View style={styles.container}>
      {/* ── Botón izquierdo: Cancelar ── */}
      <TouchableOpacity
        style={styles.sideBtn}
        onPress={onLeftPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.65}
      >
        <Text style={[styles.leftLabel, { color: current_colors.textSecondary }]}>
          {leftLabel}
        </Text>
      </TouchableOpacity>

      {/* ── Centro: Título + subtítulo ── */}
      <View style={styles.titleGroup}>
        <Text
          style={[styles.title, { color: current_colors.textPrimary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: current_colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* ── Botón derecho: Guardar / Confirmar ── */}
      <TouchableOpacity
        style={styles.sideBtn}
        onPress={onRightPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.65}
      >
        <Text style={[styles.rightLabel, { color: actionColor }]}>
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 28,
    minHeight: 44,
  },
  sideBtn: {
    paddingTop: 2,
    // Ancho mínimo para que los textos cortos no colapsen
    minWidth: 64,
  },
  titleGroup: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    textAlign: "center",
    fontWeight: "400",
  },
  leftLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  rightLabel: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },
});
