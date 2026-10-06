import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';

const Navegador = createNativeStackNavigator();

export default function App() {
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    comprobarSesion();
    solicitarPermisos();
  }, []);

  const comprobarSesion = async () => {
    const sesionGuardada = await AsyncStorage.getItem(
      'sesionIniciada'
    );

    if (sesionGuardada === 'true') {
      setSesionIniciada(true);
    }

    setCargando(false);
  };

  const solicitarPermisos = async () => {
    const permisos =
      await Notifications.requestPermissionsAsync();

    if (permisos.status !== 'granted') {
      console.log('Permiso de notificaciones rechazado');
    }
  };

  if (cargando) {
    return null;
  }

  return (
    <NavigationContainer>
      <Navegador.Navigator
        screenOptions={{
          headerTintColor: '#7C3AED',
        }}
      >
        {sesionIniciada ? (
          <>
            <Navegador.Screen
              name="Home"
              options={{ title: 'NoteTask' }}
            >
              {(propiedades) => (
                <HomeScreen
                  {...propiedades}
                  setSesionIniciada={setSesionIniciada}
                />
              )}
            </Navegador.Screen>

            <Navegador.Screen
              name="AddTask"
              component={AddTaskScreen}
              options={{ title: 'Nueva tarea' }}
            />
          </>
        ) : (
          <>
            <Navegador.Screen
              name="Login"
              options={{ title: 'Iniciar sesión' }}
            >
              {(propiedades) => (
                <LoginScreen
                  {...propiedades}
                  setSesionIniciada={setSesionIniciada}
                />
              )}
            </Navegador.Screen>

            <Navegador.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Registro' }}
            />
          </>
        )}
      </Navegador.Navigator>
    </NavigationContainer>
  );
}