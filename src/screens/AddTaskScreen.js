import { useEffect, useState } from 'react';
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
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar/legacy';
import { File, Paths } from 'expo-file-system';
import { validarFechaFutura } from '../utils/validarFecha';
import SelectorFoto from '../components/SelectorFoto';
import useTaskStore from '../store/useTaskStore';

export default function AddTaskScreen({ navigation, route }) {
  const taskId = route.params?.taskId;

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const selectedTask = tasks.find((task) => task.id === taskId);
  const isEditing = Boolean(taskId);

  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [foto, setFoto] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar tarea' : 'Nueva tarea',
    });
  }, [navigation, isEditing]);

  useEffect(() => {
    if (!selectedTask) return;

    setTitulo(selectedTask.titulo || '');
    setDescripcion(selectedTask.descripcion || '');
    setFoto(selectedTask.foto || null);
    setUbicacion(selectedTask.ubicacion || null);

    const fechaGuardada = new Date(selectedTask.fechaRecordatorio);

    if (!isNaN(fechaGuardada.getTime())) {
      setFecha(fechaGuardada);
      setHora(fechaGuardada);
    }
  }, [selectedTask?.id]);

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

  const guardarFoto = (id) => {
    if (foto === null) return null;

    if (isEditing && foto === selectedTask?.foto) {
      return foto;
    }

    const archivoOriginal = new File(foto);
    const extension = archivoOriginal.extension || '.jpg';

    const archivoGuardado = new File(
      Paths.document,
      `tarea_${id}_${Date.now()}${extension}`
    );

    archivoOriginal.copy(archivoGuardado);

    return archivoGuardado.uri;
  };

  const programarNotificacion = async (fechaRecordatorio) => {
    if (Platform.OS === 'web') return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de tarea',
        body: titulo.trim(),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fechaRecordatorio,
        channelId: 'recordatorios',
      },
    });
  };

  const guardarEventoCalendario = async (fechaRecordatorio) => {
    if (Platform.OS === 'web') return null;

    try {
      const permisos = await Calendar.requestCalendarPermissionsAsync();

      if (!permisos.granted) {
        console.log('Calendar permission denied');
        return null;
      }

      const calendarios = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );

      const calendario = calendarios.find(
        (item) => item.allowsModifications
      );

      if (!calendario) {
        console.log('No editable calendars available');
        return null;
      }

      const fechaFin = new Date(
        fechaRecordatorio.getTime() + 60 * 60 * 1000
      );

      const datosEvento = {
        title: titulo.trim(),
        startDate: fechaRecordatorio,
        endDate: fechaFin,
        notes: descripcion.trim() || 'Tarea creada desde NoteTask',
      };

      if (isEditing && selectedTask?.calendarEventId) {
        await Calendar.updateEventAsync(
          selectedTask.calendarEventId,
          datosEvento
        );

        return selectedTask.calendarEventId;
      }

      return await Calendar.createEventAsync(
        calendario.id,
        datosEvento
      );
    } catch (error) {
      console.log('Error saving calendar event:', error);
      return selectedTask?.calendarEventId || null;
    }
  };

  const guardarTarea = async () => {
    if (guardando) return;

    setMensajeError('');

    if (isEditing && !selectedTask) {
      setMensajeError('No se encontró la tarea para editar');
      return;
    }

    if (titulo.trim() === '') {
      setMensajeError('Ingresá un título para la tarea');
      return;
    }

    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
      setMensajeError('Seleccioná una fecha válida');
      return;
    }

    if (!(hora instanceof Date) || isNaN(hora.getTime())) {
      setMensajeError('Seleccioná una hora válida');
      return;
    }

    const fechaRecordatorio = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      hora.getHours(),
      hora.getMinutes()
    );

    if (
      isNaN(fechaRecordatorio.getTime()) ||
      !validarFechaFutura(fechaRecordatorio)
    ) {
      setMensajeError('El recordatorio debe ser una fecha futura');
      return;
    }

    setGuardando(true);

    let notificationId = null;
    let tareaPersistida = false;

    try {
      const id = isEditing
        ? selectedTask.id
        : Date.now().toString();

      const datosTarea = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fechaRecordatorio: fechaRecordatorio.toISOString(),
        ubicacion,
        foto: guardarFoto(id),
      };

      notificationId = await programarNotificacion(fechaRecordatorio);

      datosTarea.notificationId = notificationId;

      if (isEditing) {
        await updateTask(id, datosTarea);
      } else {
        await addTask({
          id,
          ...datosTarea,
        });
      }

      tareaPersistida = true;

      // Cancelar la notificación anterior solo después de
      // guardar correctamente la tarea actualizada.
      if (isEditing && selectedTask.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            selectedTask.notificationId
          );
        } catch (error) {
          console.log('Error canceling old notification:', error);
        }
      }

      const calendarEventId = await guardarEventoCalendario(
        fechaRecordatorio
      );

      if (calendarEventId) {
        await updateTask(id, { calendarEventId });
      }

      navigation.goBack();
    } catch (error) {
      console.log('Error saving task:', error);

      if (!tareaPersistida && notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            notificationId
          );
        } catch (cancelError) {
          console.log('Error canceling notification:', cancelError);
        }
      }

      setMensajeError('No se pudo guardar la tarea');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={estilos.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={estilos.titulo}>
        {isEditing ? 'Editar tarea' : 'Nueva tarea'}
      </Text>

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
          {fecha instanceof Date
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
          {hora instanceof Date
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
        title={
          guardando
            ? 'Guardando...'
            : isEditing
              ? 'Guardar cambios'
              : 'Guardar tarea'
        }
        color="#7C3AED"
        disabled={guardando}
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
