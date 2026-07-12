import db from './index.js'

function formatearMes(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export async function ejecutarCicloMensual() {
  const estado = await db.estado_cuenta.get(1)
  if (!estado) return

  const hoy = new Date()
  const mesActual = formatearMes(hoy)

  const resumenExistente = await db.resumen_mensual.get({ mes: mesActual })
  if (resumenExistente) return

  const m = hoy.getMonth(); const y = hoy.getFullYear()
  const primerDiaStr = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const mesAnterior = m === 0 ? `${y - 1}-12` : `${y}-${String(m).padStart(2, '0')}`
  const finMesAnteriorStr = m === 0 ? `${y}-01-01` : `${y}-${String(m).padStart(2, '0')}-01`
  const inicioMesAnteriorStr = `${mesAnterior}-01`

  const gastosDiariosMesAnterior = await db.gastos_diarios
    .where('fecha').between(inicioMesAnteriorStr, finMesAnteriorStr, true, false).toArray()

  const totalGastosDiarios = gastosDiariosMesAnterior.reduce((s, g) => s + g.monto, 0)

  const ingresosFijos = await db.ingresos_fijos.where('activo').equals(1).toArray()
  const gastosFijos = await db.gastos_fijos.where('activo').equals(1).toArray()
  const finDelMesStr = m === 11 ? `${y + 1}-01-01` : `${y}-${String(m + 2).padStart(2, '0')}-01`
  const ingresosEfimerosMes = await db.ingresos_efimeros
    .where('fecha').between(primerDiaStr, finDelMesStr, true, false).toArray()

  const totalIngresosFijos = ingresosFijos.reduce((s, i) => s + i.monto, 0)
  const totalIngresosEfimeros = ingresosEfimerosMes.reduce((s, i) => s + i.monto, 0)

  let totalGastosFijos = 0
  for (const g of gastosFijos) {
    if (g.tipo === 'cuotas') {
      if (g.cuotas_pagadas < g.total_cuotas) {
        totalGastosFijos += g.monto
        await db.gastos_fijos.update(g.id, { cuotas_pagadas: g.cuotas_pagadas + 1 })
        if (g.cuotas_pagadas + 1 >= g.total_cuotas) {
          await db.gastos_fijos.update(g.id, { activo: 0 })
        }
      }
    } else {
      totalGastosFijos += g.monto
    }
  }

  const saldoFinal = estado.total_en_mano + totalIngresosFijos + totalIngresosEfimeros - totalGastosFijos - totalGastosDiarios

  await db.resumen_mensual.add({
    mes: mesActual,
    total_ingresos_fijos: totalIngresosFijos,
    total_ingresos_efimeros: totalIngresosEfimeros,
    total_gastos_fijos: totalGastosFijos,
    total_gastos_diarios: totalGastosDiarios,
    total_en_mano: saldoFinal,
    createdAt: new Date().toISOString(),
  })

  await db.estado_cuenta.update(1, {
    total_en_mano: saldoFinal,
    updatedAt: new Date().toISOString(),
  })

  await db.gastos_diarios.clear()
}
