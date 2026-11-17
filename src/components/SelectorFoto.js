
import { useState } from 'react';
import { View, Button, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function SelectorFoto({ foto, setFoto }) {
  const elegirFoto = async () => {
    const permisos = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permisos.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceder a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  const sacarFoto = async () => {
    const permisos = await ImagePicker.requestCameraPermissionsAsync();

    if (!permisos.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceder a la cámara.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Button title="Elegir de galería" onPress={elegirFoto} color="#7C3AED" />
      <Button title="Sacar foto" onPress={sacarFoto} color="#7C3AED" />

      {foto && (
        <Image
          source={{ uri: foto }}
          style={estilos.imagen}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 10,
    marginBottom: 15,
  },
  imagen: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
});
