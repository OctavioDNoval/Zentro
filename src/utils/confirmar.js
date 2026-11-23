// Pide confirmación con el diálogo de la app (ver ConfirmacionHost).
// Devuelve una promesa que resuelve en true si el usuario confirma.
let abrir = null

export function registrarConfirmacion(fn) {
  abrir = fn
  return () => { if (abrir === fn) abrir = null }
}

export function confirmar(opciones) {
  if (!abrir) return Promise.resolve(window.confirm(opciones.titulo))
  return new Promise((resolve) => abrir({ ...opciones, resolve }))
}

// Atajo para borrar un movimiento: "¿Eliminar gasto?" + nombre y monto
export function confirmarEliminar({ tipo, nombre, monto, detalle }) {
  return confirmar({ titulo: `¿Eliminar ${tipo}?`, nombre, monto, detalle, textoConfirmar: 'Eliminar', peligro: true })
}
