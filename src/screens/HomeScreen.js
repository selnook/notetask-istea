import {
  View,
  Text,
  Button,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ setSesionIniciada }) {

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('sesionIniciada');
    setSesionIniciada(false);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Mis tareas</Text>

      <Text style={estilos.texto}>
        Todavía no tenés tareas.
      </Text>

      <Button
        title="Cerrar sesión"
        color="#7C3AED"
        onPress={cerrarSesion}
      />
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#7C3AED',
    marginBottom: 20,
  },

  texto: {
    textAlign: 'center',
    marginBottom: 30,
  },
});