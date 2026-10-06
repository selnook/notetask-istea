import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const iniciarSesion = async () => {
    if (usuario === '' || contrasena === '') {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }

    try {
      const usuarioGuardado = await AsyncStorage.getItem('usuarioRegistrado');

      if (usuarioGuardado === null) {
        Alert.alert('Error', 'No hay ningún usuario registrado');
        return;
      }

      const datosUsuario = JSON.parse(usuarioGuardado);

      if (
        usuario === datosUsuario.usuario &&
        contrasena === datosUsuario.contrasena
      ) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión');
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>NoteTask</Text>
      <Text style={estilos.subtitulo}>Iniciar sesión</Text>

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
        title="Ingresar"
        color="#7C3AED"
        onPress={iniciarSesion}
      />

      <TouchableOpacity
        style={estilos.botonRegistro}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={estilos.textoRegistro}>
          ¿No tenés cuenta? Registrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#7C3AED',
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333333',
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

  botonRegistro: {
    marginTop: 20,
    padding: 10,
  },

  textoRegistro: {
    textAlign: 'center',
    color: '#7C3AED',
    fontWeight: '500',
  },
});