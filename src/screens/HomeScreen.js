import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TaskItem from '../components/TaskItem';

export default function HomeScreen({ navigation, setSesionIniciada }) {
  const [tareas, setTareas] = useState([]);

  useFocusEffect(
    useCallback(() => {
      cargarTareas();
    }, [])
  );

 const cargarTareas = async () => {
  try {
    const tareasGuardadas = await AsyncStorage.getItem('tareas');

    if (tareasGuardadas !== null) {
      setTareas(JSON.parse(tareasGuardadas));
    } else {
      setTareas([]);
    }
  } catch (error) {
    console.log('Error al cargar las tareas');
  }
};

  const eliminarTarea = async (id) => {
    try {
      const nuevasTareas = tareas.filter(
        (tarea) => tarea.id !== id
      );

      setTareas(nuevasTareas);

      await AsyncStorage.setItem(
        'tareas',
        JSON.stringify(nuevasTareas)
      );
    } catch (error) {
      console.log('Error al eliminar la tarea');
    }
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('sesionIniciada');
    setSesionIniciada(false);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Mis tareas</Text>

      <Button
        title="Agregar tarea"
        color="#7C3AED"
        onPress={() => navigation.navigate('AddTask')}
      />

      {tareas.length === 0 ? (
        <Text style={estilos.sinTareas}>
          Todavía no tenés tareas.
        </Text>
      ) : (
        <FlatList
          data={tareas}
          keyExtractor={(tarea) => tarea.id}
          renderItem={({ item }) => (
            <TaskItem
              tarea={item}
              eliminarTarea={eliminarTarea}
            />
          )}
        />
      )}

      <View style={estilos.botonCerrarSesion}>
        <Button
          title="Cerrar sesión"
          color="#7C3AED"
          onPress={cerrarSesion}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 25,
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#7C3AED',
    marginBottom: 20,
  },

  sinTareas: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666666',
    flex: 1,
  },

  botonCerrarSesion: {
    marginTop: 20,
  },
});