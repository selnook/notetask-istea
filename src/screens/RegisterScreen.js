import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const registrarUsuario = async () => {
    setMensajeError('');
    setMensajeExito('');

    if (usuario === '' || contrasena === '') {
      setMensajeError('Complete todos los campos');
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

      setMensajeExito('Usuario registrado correctamente');

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      setMensajeError('Algo salio mal');
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Crear una cuenta</Text>

      <TextInput
        style={estilos.entrada}
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        placeholderTextColor="#666666"
      />

      <TextInput
        style={estilos.entrada}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        placeholderTextColor="#666666"
      />

      {mensajeError !== '' && (
        <Text style={estilos.error}>{mensajeError}</Text>
      )}

      {mensajeExito !== '' && (
        <Text style={estilos.exito}>{mensajeExito}</Text>
      )}

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

  error: {
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 15,
  },

  exito: {
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 15,
  },
});