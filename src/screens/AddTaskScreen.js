
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
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar/legacy';
import { File, Paths } from 'expo-file-system';
import { validarFechaFutura } from '../utils/validarFecha';
import SelectorFoto from '../components/SelectorFoto';

export default function AddTaskScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [foto, setFoto] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [descripcion, setDescripcion] = useState('');

  const elegirFecha = () => {
    DateTimePickerAndroid.open({
      value: fecha || new Date(),
      mode: 'date',
      minimumDate: new Date(),
      onValueChange: (evento, fechaSeleccionada) => {
        if (fechaSeleccionada instanceof Date) {
          setFecha(fechaSeleccionada);
        }
      },
    });
  };

  const elegirHora = () => {
    DateTimePickerAndroid.open({
      value: hora || new Date(),
      mode: 'time',
      is24Hour: true,
      onValueChange: (evento, horaSeleccionada) => {
        if (horaSeleccionada instanceof Date) {
          setHora(horaSeleccionada);
        }
      },
    });
  };

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

    if (titulo.trim() === '' || fecha === null || hora === null) {
      setMensajeError('Completá todos los campos');
      return;
    }

    const fechaRecordatorio = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      hora.getHours(),
      hora.getMinutes()
    );

    if (!validarFechaFutura(fechaRecordatorio)) {
      setMensajeError('El recordatorio debe ser una fecha futura');
      return;
    }

    try {
      const tareasGuardadas = await AsyncStorage.getItem('tareas');
      const tareas = tareasGuardadas
        ? JSON.parse(tareasGuardadas)
        : [];

      const nuevaTarea = {
        id: Date.now().toString(),
        titulo: titulo,
        descripcion: descripcion.trim(),
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

              const idEvento = await Calendar.createEventAsync(
                calendario.id,
                {
                  title: titulo,
                  startDate: fechaRecordatorio,
                  endDate: fechaFin,
                  notes: descripcion.trim() || 'Tarea creada desde NoteTask',
                }
              );
sip
            } else {
              console.log('No hay calendarios editables');
            }
          } else {
            console.log('Permiso de calendario denegado');
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
        style={[estilos.entrada, estilos.descripcion]}
        placeholder="Descripción de la tarea (opcional)"
        placeholderTextColor="#666666"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <View style={estilos.seccion}>
        <Button
          title="Seleccionar fecha"
          color="#7C3AED"
          onPress={elegirFecha}
        />

        <Text style={estilos.valor}>
          {fecha
            ? fecha.toLocaleDateString('es-AR')
            : 'Ninguna fecha seleccionada'}
        </Text>
      </View>

      <View style={estilos.seccion}>
        <Button
          title="Seleccionar hora"
          color="#7C3AED"
          onPress={elegirHora}
        />

        <Text style={estilos.valor}>
          {hora
            ? hora.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
            : 'Ninguna hora seleccionada'}
        </Text>
      </View>

      <SelectorFoto foto={foto} setFoto={setFoto} />

      <View style={estilos.seccion}>
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
          <Text style={estilos.valor}>
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
    color: '#222222',
  },

  descripcion: {
    height: 100,
  },
    
  seccion: {
    marginBottom: 15,
  },

  valor: {
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
