
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function TaskItem({ tarea, eliminarTarea }) {
  const fecha = new Date(tarea.fechaRecordatorio);

  const fechaTexto = fecha.toLocaleDateString();
  const horaTexto = fecha.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{tarea.titulo}</Text>

      <Text style={estilos.recordatorio}>
        Recordatorio: {fechaTexto} - {horaTexto}
      </Text>

      {tarea.foto && (
        <Image
          source={{ uri: tarea.foto }}
          style={estilos.foto}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        style={estilos.botonEliminar}
        onPress={() => eliminarTarea(tarea.id)}
      >
        <Text style={estilos.textoEliminar}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    backgroundColor: '#F5F3FF',
  },

  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 5,
  },

  recordatorio: {
    marginBottom: 10,
  },

  foto: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },

  botonEliminar: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 5,
  },

  textoEliminar: {
    color: '#C62828',
    textAlign: 'center',
  },
});
