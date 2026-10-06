export const validarFechaFutura = (fecha) => {
  return fecha > new Date();
};