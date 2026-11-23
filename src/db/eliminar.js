import db from './index.js'
import { actualizarTotal } from './estado-cuenta.js'
import { formatearARSCompacto, formatearMonto } from './moneda.js'
import { confirmarEliminar } from '../utils/confirmar.js'
import { snapshotGastoDelMes, borrarGastoFijo } from './gastos-fijos.js'

// Cada función pide confirmación, borra y ajusta el total en mano.
// Devuelve true si se eliminó. La usan tanto los modales como deslizar para borrar.

const mesActual = () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
const numero = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0)

export async function eliminarGastoDiario(gasto) {
  const ok = await confirmarEliminar({ tipo: 'gasto', nombre: gasto.concepto, monto: formatearARSCompacto(gasto.monto), detalle: 'El monto vuelve a tu total en mano.' })
  if (!ok) return false
  const monto = numero(gasto.monto)
  await db.gastos_diarios.delete(gasto.id)
  if (monto > 0) await actualizarTotal(monto)
  return true
}

export async function eliminarGastoFijo(gasto) {
  const snapshot = await snapshotGastoDelMes(gasto.id)
  const ok = await confirmarEliminar({
    tipo: 'gasto fijo', nombre: gasto.nombre, monto: formatearMonto(gasto.monto, gasto.moneda),
    detalle: snapshot ? `Como ya se descontó este mes, ${formatearARSCompacto(Math.round(snapshot.monto_ars))} vuelven a tu total en mano.` : undefined,
  })
  if (!ok) return false
  await borrarGastoFijo(gasto)
  return true
}

export async function eliminarIngresoEfimero(ingreso) {
  const ok = await confirmarEliminar({ tipo: 'ingreso', nombre: ingreso.nombre, monto: formatearARSCompacto(ingreso.monto), detalle: 'El monto se descuenta de tu total en mano.' })
  if (!ok) return false
  const monto = numero(ingreso.monto)
  await db.ingresos_efimeros.delete(ingreso.id)
  if (monto > 0) await actualizarTotal(-monto)
  return true
}

export async function eliminarIngresoFijo(ingreso) {
  const mes = mesActual()
  const aplicadoEsteMes = ingreso.mes_aplicado === mes
  const ok = await confirmarEliminar({
    tipo: 'ingreso fijo', nombre: ingreso.nombre, monto: formatearARSCompacto(ingreso.monto),
    detalle: aplicadoEsteMes ? 'Como ya se cobró este mes, el monto se descuenta de tu total en mano.' : undefined,
  })
  if (!ok) return false
  const monto = numero(ingreso.monto)
  await db.transaction('rw', db.ingresos_fijos, db.movimientos_fijos_mensuales, db.estado_cuenta, async () => {
    await db.ingresos_fijos.delete(ingreso.id)
    if (!aplicadoEsteMes) return
    if (monto > 0) {
      const estado = await db.estado_cuenta.get(1)
      const actual = Number.isFinite(estado?.total_en_mano) ? estado.total_en_mano : 0
      await db.estado_cuenta.update(1, { total_en_mano: actual - monto, updatedAt: new Date().toISOString() })
    }
    const snapshot = await db.movimientos_fijos_mensuales
      .where('mes').equals(mes)
      .filter((item) => item.tipo === 'ingreso' && item.referenciaId === ingreso.id)
      .first()
    if (snapshot) await db.movimientos_fijos_mensuales.delete(snapshot.id)
  })
  return true
}

export async function eliminarAhorro(ahorro) {
  const ok = await confirmarEliminar({ tipo: 'ahorro', nombre: ahorro.nombre, monto: formatearMonto(ahorro.monto, ahorro.moneda), detalle: ahorro.descontadoDeTotal ? 'El monto vuelve a tu total en mano.' : undefined })
  if (!ok) return false
  const monto = numero(ahorro.monto)
  await db.ahorros.delete(ahorro.id)
  if (ahorro.descontadoDeTotal && monto > 0) await actualizarTotal(monto)
  return true
}
