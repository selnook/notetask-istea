
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { File, Paths } from 'expo-file-system';
import { validarFechaFutura } from '../utils/validarFecha';
import SelectorFoto from '../components/SelectorFoto';
import * as Calendar from 'expo-calendar/legacy';

export default function AddTaskScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [foto, setFoto] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  const obtenerUbicacion = async () => {
    setObteniendoUbicacion(true);
    setMensajeError('');

    try {
      const permisos = await Location.requestForegroundPermissionsAsync();

      if (!permisos.granted) {
        setMensajeError('Se necesita permiso de ubicación');
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUbicacion({
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
      });
    } catch (error) {
      setMensajeError('No se pudo obtener la ubicación');
    } finally {
      setObteniendoUbicacion(false);
    }
  };

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
        ubicacion: ubicacion,
      };

      if (foto !== null) {
        const archivoOriginal = new File(foto);
        const extension = archivoOriginal.extension || '.jpg';

        const archivoGuardado = new File(
          Paths.document,
          `tarea_${nuevaTarea.id}${extension}`
        );

        archivoOriginal.copy(archivoGuardado);
        nuevaTarea.foto = archivoGuardado.uri;
      }

      if (Platform.OS !== 'web') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Recordatorio de tarea',
            body: titulo,
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

      if (Platform.OS !== 'web') {
        try {
          const permisos = await Calendar.requestCalendarPermissionsAsync();

          if (permisos.granted) {
            const calendarios = await Calendar.getCalendarsAsync(
              Calendar.EntityTypes.EVENT
            );

            const calendario = calendarios.find(
              (item) => item.allowsModifications
            );

            if (calendario) {
              const fechaFin = new Date(
                fechaRecordatorio.getTime() + 60 * 60 * 1000
              );

              await Calendar.createEventAsync(calendario.id, {
                title: titulo,
                startDate: fechaRecordatorio,
                endDate: fechaFin,
                notes: 'Tarea creada desde NoteTask',
              });
            } else {
              console.log('No hay calendarios disponibles para crear eventos');
            }
          }
        } catch (error) {
          console.log('Error al crear evento de calendario:', error);
        }
      }

      navigation.goBack();
    } catch (error) {
      console.log('Error al guardar tarea:', error);
      setMensajeError('No se pudo guardar la tarea');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={estilos.contenedor}
      keyboardShouldPersistTaps="handled"
    >
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

      <SelectorFoto foto={foto} setFoto={setFoto} />

      <View style={estilos.seccionUbicacion}>
        <Button
          title={
            obteniendoUbicacion
              ? 'Obteniendo ubicación...'
              : 'Agregar ubicación actual'
          }
          color="#7C3AED"
          disabled={obteniendoUbicacion}
          onPress={obtenerUbicacion}
        />

        {ubicacion !== null && (
          <Text style={estilos.ubicacion}>
            Ubicación guardada: {ubicacion.latitud.toFixed(5)},
            {' '}{ubicacion.longitud.toFixed(5)}
          </Text>
        )}
      </View>

      {mensajeError !== '' && (
        <Text style={estilos.error}>{mensajeError}</Text>
      )}

      <Button
        title="Guardar tarea"
        color="#7C3AED"
        onPress={guardarTarea}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
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

  seccionUbicacion: {
    marginBottom: 15,
  },

  ubicacion: {
    textAlign: 'center',
    marginTop: 10,
    color: '#7C3AED',
  },

  error: {
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 15,
  },
});
