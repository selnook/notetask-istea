import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useTaskStore = create((set, get) => ({
  tasks: [],

  loadTasks: async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tareas');
      set({ tasks: savedTasks ? JSON.parse(savedTasks) : [] });
    } catch (error) {
      console.log('Error loading tasks:', error);
    }
  },

  addTask: async (newTask) => {
    const tasks = [...get().tasks, newTask];
    await AsyncStorage.setItem('tareas', JSON.stringify(tasks));
    set({ tasks });
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter((task) => task.id !== id);
    await AsyncStorage.setItem('tareas', JSON.stringify(tasks));
    set({ tasks });
  },

  updateTask: async (id, changes) => {
    const tasks = get().tasks.map((task) =>
      task.id === id
        ? { ...task, ...changes, id: task.id }
        : task
    );

    await AsyncStorage.setItem('tareas', JSON.stringify(tasks));
    set({ tasks });
  },
}));

export default useTaskStore;
