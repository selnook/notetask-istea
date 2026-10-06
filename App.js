import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';

const Navegador = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Navegador.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerTintColor: '#7C3AED',
        }}
      >
        <Navegador.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Iniciar sesión' }}
        />

        <Navegador.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Registro' }}
        />

        <Navegador.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'NoteTask' }}
        />

        <Navegador.Screen
          name="AddTask"
          component={AddTaskScreen}
          options={{ title: 'Nueva tarea' }}
        />
      </Navegador.Navigator>
    </NavigationContainer>
  );
}