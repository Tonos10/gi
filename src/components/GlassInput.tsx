import React from 'react';
import { StyleSheet, View, TextInput, TextInputProps } from 'react-native';

export const GlassInput: React.FC<TextInputProps> = (props) => {
  return (
    <View style={styles.inputGlass}>
      <TextInput 
        placeholderTextColor="rgba(255,255,255,.28)"
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGlass: {
    backgroundColor: "rgba(255,255,255,.20)",
    borderRadius: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.35)",
    shadowColor: "#fff",
    shadowOpacity: .08,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    color: '#fff',
    fontSize: 18,
    paddingVertical: 16,
    fontWeight: '600',
  }
});
