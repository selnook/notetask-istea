
import { useCallback } from 'react';
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
import useTaskStore from '../store/useTaskStore';

export default function HomeScreen({ navigation, setSesionIniciada }) {
  const tasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

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

      {tasks.length === 0 ? (
        <Text style={estilos.sinTareas}>
          Todavía no tenés tareas.
        </Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(task) => task.id}
          renderItem={({ item }) => (
            <TaskItem
              tarea={item}
              eliminarTarea={deleteTask}
              editarTarea={() => navigation.navigate('AddTask', {
                taskId: item.id,
              })}
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
