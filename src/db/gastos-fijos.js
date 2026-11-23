import db from './index.js'
import { obtenerCotizacionBlue, convertirARS } from './moneda.js'

// Lógica de gastos fijos, en espejo de la de ingresos fijos.
// La fuente de verdad de "ya se descontó este mes" es el registro del mes en
// movimientos_fijos_mensuales (el mismo que usa el cierre y el Dashboard).

export const mesActualStr = () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

export function snapshotGastoDelMes(gastoId, mes = mesActualStr()) {
  return db.movimientos_fijos_mensuales
    .where('mes').equals(mes)
    .filter((m) => m.tipo === 'gasto' && m.referenciaId === gastoId)
    .first()
}

async function cotizacionPara(moneda) {
  if (moneda !== 'USD') return 1
  const cot = await obtenerCotizacionBlue()
  if (!cot) throw new Error('No hay cotización del dólar disponible. Conectate a internet e intentá de nuevo.')
  return cot
}

async function moverTotal(delta) {
  const estado = await db.estado_cuenta.get(1)
  const actual = Number.isFinite(estado?.total_en_mano) ? estado.total_en_mano : 0
  await db.estado_cuenta.update(1, { total_en_mano: actual + delta, updatedAt: new Date().toISOString() })
}

// Crea un gasto fijo. Con descontarAhora se descuenta ya del total y cuenta como
// cobrado este mes (en cuotas, como primera cuota pagada).
export async function crearGastoFijo({ nombre, monto, moneda, tipo, totalCuotas }, descontarAhora) {
  const mes = mesActualStr()
  const cotizacion = descontarAhora ? await cotizacionPara(moneda) : 1
  const ahora = new Date().toISOString()
  const data = { nombre, monto, moneda, tipo, activo: 1, createdAt: ahora }
  if (tipo === 'cuotas') {
    data.total_cuotas = totalCuotas
    data.cuotas_pagadas = descontarAhora ? 1 : 0
    if (descontarAhora && totalCuotas <= 1) data.activo = 0
  }

  await db.transaction('rw', db.gastos_fijos, db.movimientos_fijos_mensuales, db.estado_cuenta, async () => {
    const id = await db.gastos_fijos.add(data)
    if (!descontarAhora) return
    const montoArs = convertirARS(monto, moneda, cotizacion)
    await db.movimientos_fijos_mensuales.add({
      mes, tipo: 'gasto', referenciaId: id, nombre, monto, moneda,
      monto_ars: montoArs, cotizacion,
      cuotas_pagadas: tipo === 'cuotas' ? 1 : null,
      origen: 'alta', createdAt: ahora,
    })
    await moverTotal(-montoArs)
  })
}

// Edita un gasto fijo. Si ya se descontó este mes y cambia el monto o la moneda,
// se ajusta el total en mano por la diferencia (igual que con los ingresos fijos).
export async function actualizarGastoFijo(gasto, { nombre, monto, moneda, tipo, totalCuotas }) {
  const snapshot = await snapshotGastoDelMes(gasto.id)
  let cotizacion = 1
  if (snapshot && moneda === 'USD') {
    cotizacion = snapshot.moneda === 'USD' && snapshot.cotizacion ? snapshot.cotizacion : await cotizacionPara('USD')
  }

  const data = { nombre, monto, moneda, tipo }
  if (tipo === 'cuotas') {
    const pagadas = Number(gasto.cuotas_pagadas) || 0
    data.total_cuotas = totalCuotas
    data.cuotas_pagadas = pagadas
    // Si ya se pagaron todas, el gasto está terminado
    data.activo = pagadas >= totalCuotas ? 0 : 1
  } else {
    data.total_cuotas = null
    data.cuotas_pagadas = 0
    data.activo = 1
  }

  await db.transaction('rw', db.gastos_fijos, db.movimientos_fijos_mensuales, db.estado_cuenta, async () => {
    await db.gastos_fijos.update(gasto.id, data)
    if (!snapshot) return
    const nuevoArs = convertirARS(monto, moneda, cotizacion)
    const diff = nuevoArs - (Number(snapshot.monto_ars) || 0)
    await db.movimientos_fijos_mensuales.update(snapshot.id, { nombre, monto, moneda, monto_ars: nuevoArs, cotizacion })
    if (diff !== 0) await moverTotal(-diff)
  })

  return { terminado: data.activo === 0 }
}

// Borra un gasto fijo. Si ya se descontó este mes, devuelve ese monto al total.
export async function borrarGastoFijo(gasto) {
  const snapshot = await snapshotGastoDelMes(gasto.id)
  await db.transaction('rw', db.gastos_fijos, db.movimientos_fijos_mensuales, db.estado_cuenta, async () => {
    await db.gastos_fijos.delete(gasto.id)
    if (!snapshot) return
    await db.movimientos_fijos_mensuales.delete(snapshot.id)
    const monto = Number(snapshot.monto_ars) || 0
    if (monto > 0) await moverTotal(monto)
  })
}
