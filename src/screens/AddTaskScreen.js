import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { validarFechaFutura } from '../utils/validarFecha';

export default function AddTaskScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const guardarTarea = async () => {
    setMensajeError('');

    if (
      titulo.trim() === '' ||
      fecha.trim() === '' ||
      hora.trim() === ''
    ) {
      setMensajeError('Completá todos los campos');
      return;
    }

    const partesFecha = fecha.split('/');
    const partesHora = hora.split(':');

    if (partesFecha.length !== 3 || partesHora.length !== 2) {
      setMensajeError('Ingresá una fecha y hora válidas');
      return;
    }

    const dia = Number(partesFecha[0]);
    const mes = Number(partesFecha[1]) - 1;
    const anio = Number(partesFecha[2]);

    const horas = Number(partesHora[0]);
    const minutos = Number(partesHora[1]);

    const fechaRecordatorio = new Date(
      anio,
      mes,
      dia,
      horas,
      minutos
    );

    if (
      isNaN(fechaRecordatorio.getTime()) ||
      !validarFechaFutura(fechaRecordatorio)
    ) {
      setMensajeError('El recordatorio debe ser una fecha futura');
      return;
    }

    try {
      const tareasGuardadas = await AsyncStorage.getItem('tareas');

      let tareas = [];

      if (tareasGuardadas !== null) {
        tareas = JSON.parse(tareasGuardadas);
      }

      const nuevaTarea = {
        id: Date.now().toString(),
        titulo: titulo,
        fechaRecordatorio: fechaRecordatorio.toISOString(),
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de tarea',
          body: titulo,
        },
        trigger: {
          date: fechaRecordatorio,
        },
      });

      tareas.push(nuevaTarea);

      await AsyncStorage.setItem(
        'tareas',
        JSON.stringify(tareas)
      );

      navigation.goBack();
    } catch (error) {
      setMensajeError('No se pudo guardar la tarea');
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Nueva tarea</Text>

      <TextInput
        style={estilos.entrada}
        placeholder="Título de la tarea"
        value={titulo}
        onChangeText={setTitulo}
        placeholderTextColor="#666666"
      />

      <TextInput
        style={estilos.entrada}
        placeholder="Fecha (DD/MM/AAAA)"
        value={fecha}
        onChangeText={setFecha}
        placeholderTextColor="#666666"
      />

      <TextInput
        style={estilos.entrada}
        placeholder="Hora (HH:MM)"
        value={hora}
        onChangeText={setHora}
        placeholderTextColor="#666666"
      />

      {mensajeError !== '' && (
        <Text style={estilos.error}>
          {mensajeError}
        </Text>
      )}

      <Button
        title="Guardar tarea"
        color="#7C3AED"
        onPress={guardarTarea}
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
});