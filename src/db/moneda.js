import db from './index.js'

const DOLAR_API = 'https://dolarapi.com/v1/dolares'
export const CASAS = ['blue', 'oficial', 'mep', 'ccl']

export async function fetchCotizaciones() {
  try {
    const res = await fetch(DOLAR_API)
    if (!res.ok) throw new Error('Error HTTP: ' + res.status)
    const data = await res.json()
    const cotizaciones = data.filter((d) => CASAS.includes(d.casa))
    await db.cotizaciones.bulkPut(cotizaciones.map((c) => ({
      casa: c.casa,
      compra: c.compra,
      venta: c.venta,
      nombre: c.nombre,
      fechaActualizacion: c.fechaActualizacion,
    })))
    return cotizaciones
  } catch (err) {
    console.error('Error fetching cotizaciones:', err)
    const cached = await db.cotizaciones.toArray()
    return cached.length > 0 ? cached : null
  }
}

export async function obtenerCotizacionBlue() {
  const cached = await db.cotizaciones.get('blue')
  if (cached?.venta) return cached.venta
  const data = await fetchCotizaciones()
  const blue = data?.find((c) => c.casa === 'blue')
  return blue?.venta ?? null
}

export function convertirARS(monto, moneda, cotizacion) {
  const n = Number(monto) || 0
  if (moneda !== 'USD') return n
  if (!cotizacion) {
    console.warn('No hay cotización blue disponible: no se puede convertir USD a ARS')
    return 0
  }
  return n * cotizacion
}

export function parseMonto(valor) {
  let limpio = String(valor ?? '').trim().replace(/[$\s]/g, '')
  if (!limpio) return NaN
  if (limpio.includes(',')) {
    limpio = limpio.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) {
    limpio = limpio.replace(/\./g, '')
  }
  const n = Number(limpio)
  return Number.isFinite(n) ? n : NaN
}

export function esMontoValido(valor) {
  const n = parseMonto(valor)
  return Number.isFinite(n) && n > 0
}

export function formatearARS(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatearARSCompacto(n) {
  return '$' + (Number(n) || 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

export function formatearUSD(n) {
  return 'USD ' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatearMonto(n, moneda) {
  return moneda === 'USD' ? formatearUSD(n) : formatearARS(n)
}
