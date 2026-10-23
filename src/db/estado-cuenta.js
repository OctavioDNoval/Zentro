import db from './index.js'

export async function actualizarTotal(delta) {
  if (!Number.isFinite(delta)) throw new Error('Monto inválido')
  const estado = await db.estado_cuenta.get(1)
  const actual = Number.isFinite(estado?.total_en_mano) ? estado.total_en_mano : 0
  await db.estado_cuenta.update(1, { total_en_mano: actual + delta, updatedAt: new Date().toISOString() })
}