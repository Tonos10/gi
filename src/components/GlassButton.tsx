import React from 'react';
import { StyleSheet, TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassButtonProps extends TouchableOpacityProps {
  title: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ title, ...props }) => {
  return (
    <TouchableOpacity style={styles.glassButton} {...props}>
      <BlurView intensity={50} style={styles.blurContainer}>
        <Text style={styles.text}>{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  glassButton: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.35)",
  },
  blurContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgba(255,255,255,.10)", // Subtle background for consistency
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  }
});
