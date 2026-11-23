import { liveQuery } from 'dexie'
import db from './index.js'

// La cotización se reescribe sola cada vez que se consulta: si la observáramos,
// cada recarga dispararía otra recarga.
const IGNORADAS = new Set(['cotizaciones'])

// Observa la base de datos y avisa a toda la app ('zentro:data-changed') ante
// cualquier cambio, venga de donde venga (un modal, deslizar para borrar, el
// cierre mensual, una importación u otra pestaña del navegador). Así el total
// en mano y el resto de las pantallas se actualizan al instante.
export function observarCambios() {
  let primera = true
  let timer = null
  const consulta = liveQuery(() =>
    Promise.all(db.tables.filter((t) => !IGNORADAS.has(t.name)).map((t) => t.toArray())),
  )
  const sub = consulta.subscribe({
    next: () => {
      if (primera) { primera = false; return }
      // Varias escrituras seguidas (p. ej. borrar un gasto + ajustar el total) → un solo aviso
      clearTimeout(timer)
      timer = setTimeout(() => window.dispatchEvent(new CustomEvent('zentro:data-changed')), 30)
    },
    error: (err) => console.error('Error observando cambios:', err),
  })
  return () => { clearTimeout(timer); sub.unsubscribe() }
}
