import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useAppTheme } from "../hooks/useAppTheme";

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
  label,
}: Props) => {
  const { current_colors } = useAppTheme();

  // LÃ³gica matemÃ¡tica
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Calculamos cuÃ¡nto del trazo se oculta.
  // Si percentage es 100, strokeDashoffset es 0 (se ve todo el cÃ­rculo).
  const strokeDashoffset =
    circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* CÃ­rculo de fondo (Gris/Borde) */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={current_colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* CÃ­rculo de progreso (Verde/Marca) */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={current_colors.primary}
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
          <Text
            style={[
              styles.percentageText,
              { color: current_colors.textPrimary },
            ]}
          >
            {percentage}%
          </Text>
          {label && (
            <Text
              style={[styles.label, { color: current_colors.textSecondary }]}
            >
              {label}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  textContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  percentageText: { fontSize: 32, fontWeight: "bold" },
  label: { fontSize: 14, marginTop: 4 },
});
