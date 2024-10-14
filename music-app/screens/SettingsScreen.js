import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, TextInput } from 'react-native';

const SettingsScreen = (props) => {
  const { serverUrl, updateServerUrl } = props;
  const [inputValue, setInputValue] = useState(serverUrl);

  const onSave = () => {
    console.log({ serverUrl, inputValue });
    updateServerUrl(inputValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Server URL"
          value={inputValue}
          onChangeText={setInputValue}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <TouchableOpacity onPress={onSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212', // Fondo oscuro
  },
  header: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0B0B0', // Color de borde más suave
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF', // Color de texto blanco
    backgroundColor: '#1E1E1E', // Fondo de entrada
  },
  saveButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;
