# NoteTask

Aplicación de tareas hecha con React Native y Expo para la materia de Aplicaciones Móviles.

La idea es poder crear tareas, ponerles una fecha de recordatorio y tenerlas guardadas en el celular.

## Primer parcial

En la primera entrega se desarrolló la base de la aplicación:

- Pantalla de inicio de sesión y registro.
- Guardado de usuarios y sesión con AsyncStorage.
- Pantalla principal con listado de tareas.
- Creación y eliminación de tareas.
- Título, descripción, fecha y hora para cada tarea.
- Guardado local de las tareas, incluso al cerrar la aplicación.
- Navegación entre las cuatro pantallas.
- Implementación inicial de notificaciones locales.

**Pendiente de la primera entrega:** las notificaciones estaban implementadas, pero todavía no funcionaba correctamente.

## Segundo parcial

Para la segunda entrega se continuó trabajando sobre la misma aplicación y se agregaron varias funcionalidades:

- Se corrigió el funcionamiento de las notificaciones.
- Se agregó la posibilidad de adjuntar fotos desde la cámara o galería.
- Se incorporó la ubicación GPS a las tareas, con un botón para abrirla en Google Maps.
- Se agregó la creación de eventos en el calendario del celular.
- Se agregó la edición de tareas existentes.
- Se implementó Zustand para manejar las tareas desde un estado global.
- Se incorporaron 3 pruebas automatizadas con Jest, todas aprobadas.

Para desarrollar y probar la aplicación en Android utilicé `npx expo run:android`, ejecutándola directamente en el celular conectado por USB mediante ADB.

Implementación de Zustand con ayuda de ChatGPT

Para incorporar Zustand usé ChatGPT como asistencia, ya que no había trabajado antes con esa librería.

Hasta ese momento las tareas se manejaban desde las pantallas con estados locales y AsyncStorage. La idea era pasar esa lógica a un store global sin perder las funcionalidades existentes.

**Ejemplo de prompt utilizado:**

> tengo que agregar zustand a mi app de react native para el segundo parcial. ahora las tareas se guardan con asyncstorage y se manejan desde las pantallas. quiero que me ayudes a pasarlas a un store global, con funciones para agregar, eliminar y actualizar tareas. la idea es no romper lo que ya tengo funcionando, asi que vamos de a poco.

**Ejemplo de respuesta de ChatGPT:**

> Podemos crear un archivo `useTaskStore.js` dentro de `src/store` y manejar las tareas desde ahí.
>
> El store va a tener un arreglo `tasks` y cuatro funciones: `loadTasks`, `addTask`, `deleteTask` y `updateTask`.
>
> Vamos a seguir usando AsyncStorage para guardar los datos. Después modificamos HomeScreen y AddTaskScreen para que utilicen Zustand en lugar de manejar las tareas directamente.
>
> Lo hacemos por partes para poder probar que siga funcionando todo.

Finalmente se creó el store en `src/store/useTaskStore.js` y se adaptaron las pantallas para utilizarlo. También se incorporó la edición de tareas usando `updateTask()`.

AsyncStorage se sigue utilizando para conservar las tareas al cerrar la aplicación.

Los cambios se fueron integrando y probando directamente en Android para comprobar que las funcionalidades anteriores siguieran funcionando.

## Cómo ejecutar la aplicación

Para desarrollar y probar NoteTask utilicé `npx expo run:android` directamente con mi celular conectado por USB mediante ADB, en lugar de utilizar Expo Go.

Elegí hacerlo de esta manera porque me resultó más fácil y práctico para probar la aplicación y sus funcionalidades directamente en Android.

Para ejecutarla, primero hay que instalar las dependencias:

```bash
npm install
```

Después, con el celular conectado y la depuración USB habilitada:

```bash
npx expo run:android
```

Esto compila, instala y ejecuta la aplicación directamente en el dispositivo.