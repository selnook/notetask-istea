import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const registrarUsuario = async () => {
    if (usuario === '' || contrasena === '') {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }

    const datosUsuario = {
      usuario: usuario,
      contrasena: contrasena,
    };

    try {
      await AsyncStorage.setItem(
        'usuarioRegistrado',
        JSON.stringify(datosUsuario)
      );

      Alert.alert('Registro exitoso', 'Usuario registrado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el usuario');
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Crear cuenta</Text>

      <TextInput
        style={estilos.entrada}
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
      />

      <TextInput
        style={estilos.entrada}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
      />

      <Button
        title="Registrarse"
        color="#7C3AED"
        onPress={registrarUsuario}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#7C3AED',
    marginBottom: 30,
  },

  entrada: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
});