import {
  render,
  fireEvent,
} from '@testing-library/react-native';

import TaskItem from './TaskItem';

describe('TaskItem', () => {
  const tarea = {
    id: '1',
    titulo: 'Hacer trabajo práctico',
    fechaRecordatorio: '2026-12-12T15:30:00.000Z',
  };

  test('muestra el título de la tarea', async () => {
    const { getByText } = await render(
      <TaskItem
        tarea={tarea}
        eliminarTarea={() => {}}
      />
    );

    expect(getByText('Hacer trabajo práctico')).toBeTruthy();
  });

  test('ejecuta eliminarTarea al presionar Eliminar', async () => {
    const eliminarTarea = jest.fn();

    const { getByText } = await render(
      <TaskItem
        tarea={tarea}
        eliminarTarea={eliminarTarea}
      />
    );

    fireEvent.press(getByText('Eliminar'));

    expect(eliminarTarea).toHaveBeenCalledWith('1');
  });
});