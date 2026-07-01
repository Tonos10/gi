import {
  BackdropFilter,
  Blur,
  Canvas,
  Fill
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface GlassPanelProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, style }) => {
  return (
    <View style={[styles.outerBorder, style]}>
      {/* 1. Fondo de cristal con Skia (Idéntico en iOS y Android) */}
      <Canvas style={StyleSheet.absoluteFill}>
        <BackdropFilter filter={<Blur blur={15} />}>
          <Fill color="rgba(255, 255, 255, 0.1)" />
        </BackdropFilter>
      </Canvas>

      {/* 2. Tu gradiente actual para darle el "brillo" del cristal */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,.25)",
          "rgba(255,255,255,.05)",
          "rgba(255,255,255,.15)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. Tus bordes y contenido */}
      <View style={styles.topGlow} />
      <View style={styles.innerBorder} />

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBorder: {
    width: "100%",
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.35)",
    overflow: "hidden",
  },
  content: {
    padding: 24,
  },
  topGlow: {
    /* ... tu estilo original ... */
  },
  innerBorder: {
    /* ... tu estilo original ... */
  },
});
