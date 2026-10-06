import { validarFechaFutura } from './validarFecha';

describe('validarFechaFutura', () => {
  test('devuelve true cuando la fecha es futura', () => {
    const fechaFutura = new Date('2100-01-01T12:00:00');

    expect(validarFechaFutura(fechaFutura)).toBe(true);
  });
});