import db from './index.js'
import { obtenerCotizacionBlue, convertirARS } from './moneda.js'

async function limpiarResumenesViejos() {
  const estado = await db.estado_cuenta.get(1)
  if (!estado || estado.resumenes_migrados) return
  await db.resumen_mensual.clear()
  await db.estado_cuenta.update(1, { resumenes_migrados: true, updatedAt: new Date().toISOString() })
}

export async function ejecutarCicloMensual() {
  const estado = await db.estado_cuenta.get(1)
  if (!estado) return

  await limpiarResumenesViejos()

  const hoy = new Date()
  const m = hoy.getMonth(); const y = hoy.getFullYear()
  const mesAnterior = m === 0 ? `${y - 1}-12` : `${y}-${String(m).padStart(2, '0')}`
  const mesActual = `${y}-${String(m + 1).padStart(2, '0')}`

  const resumenExistente = await db.resumen_mensual.get({ mes: mesAnterior })
  if (resumenExistente) return

  const primerDiaStr = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const inicioMesAnteriorStr = `${mesAnterior}-01`

  const gastosDiariosMesAnterior = await db.gastos_diarios
    .where('fecha').between(inicioMesAnteriorStr, primerDiaStr, true, false).toArray()

  const totalGastosDiarios = gastosDiariosMesAnterior.reduce((s, g) => s + g.monto, 0)

  const ingresosFijos = await db.ingresos_fijos.where('activo').equals(1).toArray()
  const gastosFijos = await db.gastos_fijos.where('activo').equals(1).toArray()
  const ingresosEfimerosMesAnterior = await db.ingresos_efimeros
    .where('fecha').between(inicioMesAnteriorStr, primerDiaStr, true, false).toArray()

  const totalIngresosFijos = ingresosFijos.reduce((s, i) => s + i.monto, 0)
  const totalIngresosEfimeros = ingresosEfimerosMesAnterior.reduce((s, i) => s + i.monto, 0)

  const cotizacion = await obtenerCotizacionBlue()

  let totalGastosFijos = 0
  for (const g of gastosFijos) {
    if (g.tipo === 'cuotas') {
      if (g.cuotas_pagadas < g.total_cuotas) {
        totalGastosFijos += convertirARS(g.monto, g.moneda, cotizacion)
        await db.gastos_fijos.update(g.id, { cuotas_pagadas: g.cuotas_pagadas + 1 })
        if (g.cuotas_pagadas + 1 >= g.total_cuotas) {
          await db.gastos_fijos.update(g.id, { activo: 0 })
        }
      }
    } else {
      totalGastosFijos += convertirARS(g.monto, g.moneda, cotizacion)
    }
  }

  let deltaIngresosFijos = 0
  for (const i of ingresosFijos) {
    if (i.mes_aplicado !== mesActual) {
      deltaIngresosFijos += i.monto
      await db.ingresos_fijos.update(i.id, { mes_aplicado: mesActual })
    }
  }

  const totalIngresos = totalIngresosFijos + totalIngresosEfimeros
  const totalGastos = totalGastosFijos + totalGastosDiarios
  const ahorro = totalIngresos - totalGastos
  const saldoFinal = estado.total_en_mano + deltaIngresosFijos - totalGastosFijos

  await db.resumen_mensual.add({
    mes: mesAnterior,
    total_ingresos_fijos: totalIngresosFijos,
    total_ingresos_efimeros: totalIngresosEfimeros,
    total_gastos_fijos: totalGastosFijos,
    total_gastos_diarios: totalGastosDiarios,
    ahorro,
    total_en_mano: saldoFinal,
    createdAt: new Date().toISOString(),
  })

  await db.estado_cuenta.update(1, {
    total_en_mano: saldoFinal,
    updatedAt: new Date().toISOString(),
  })

  await db.gastos_diarios.clear()
}
