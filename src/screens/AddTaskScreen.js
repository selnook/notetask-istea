import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { validarFechaFutura } from '../utils/validarFecha';
import SelectorFoto from '../components/SelectorFoto';

export default function AddTaskScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [foto, setFoto] = useState(null);

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
      const tareasGuardadas =
        await AsyncStorage.getItem('tareas');

      let tareas = [];

      if (tareasGuardadas !== null) {
        tareas = JSON.parse(tareasGuardadas);
      }

      const nuevaTarea = {
        id: Date.now().toString(),
        titulo: titulo,
        fechaRecordatorio: fechaRecordatorio.toISOString(),
      };

      if (Platform.OS !== 'web') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Recordatorio de tarea',
            body: titulo,
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fechaRecordatorio,
            channelId: 'recordatorios',
          },
        });
      }

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
        placeholderTextColor="#666666"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={estilos.entrada}
        placeholder="Fecha (DD/MM/AAAA)"
        placeholderTextColor="#666666"
        value={fecha}
        onChangeText={setFecha}
      />

      <TextInput
        style={estilos.entrada}
        placeholder="Hora (HH:MM)"
        placeholderTextColor="#666666"
        value={hora}
        onChangeText={setHora}
      />

      {mensajeError !== '' && (
        <Text style={estilos.error}>
          {mensajeError}
        </Text>
      )}

      <SelectorFoto foto={foto} setFoto={setFoto} />

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