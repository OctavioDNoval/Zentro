import db from './index.js'
import { obtenerCotizacionBlue, convertirARS } from './moneda.js'

function pad(n) {
  return String(n).padStart(2, '0')
}

function mesActualStr() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}`
}

function mesAnteriorStr(mes) {
  const [y, m] = mes.split('-').map(Number)
  return m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`
}

function mesSiguienteStr(mes) {
  const [y, m] = mes.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`
}

function primerDiaMes(mes) {
  return `${mes}-01`
}

function finMesExclusivo(mes) {
  return `${mesSiguienteStr(mes)}-01`
}

function numero(valor) {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function mesDeCreatedAt(valor) {
  if (valor instanceof Date) return `${valor.getFullYear()}-${pad(valor.getMonth() + 1)}`
  const mes = String(valor || '').slice(0, 7)
  return /^\d{4}-\d{2}$/.test(mes) ? mes : null
}

function fechaISO(valor) {
  if (valor instanceof Date) return valor.toISOString()
  return String(valor || '')
}

function listarMeses(desde, hasta) {
  const meses = []
  let actual = desde
  let seguridad = 0

  while (actual <= hasta && seguridad < 600) {
    meses.push(actual)
    actual = mesSiguienteStr(actual)
    seguridad += 1
  }

  return meses
}

async function primerMesConDatos() {
  const [gasto, ingreso, fijo, ingresosFijos, gastosFijos, reporte] = await Promise.all([
    db.gastos_diarios.orderBy('fecha').first(),
    db.ingresos_efimeros.orderBy('fecha').first(),
    db.movimientos_fijos_mensuales.orderBy('mes').first(),
    db.ingresos_fijos.toArray(),
    db.gastos_fijos.toArray(),
    db.resumen_mensual.orderBy('mes').first(),
  ])

  const meses = []

  if (gasto?.fecha) meses.push(String(gasto.fecha).slice(0, 7))
  if (ingreso?.fecha) meses.push(String(ingreso.fecha).slice(0, 7))
  if (fijo?.mes) meses.push(String(fijo.mes).slice(0, 7))
  if (reporte?.mes) meses.push(String(reporte.mes).slice(0, 7))

  for (const row of [...ingresosFijos, ...gastosFijos]) {
    const mes = mesDeCreatedAt(row?.createdAt)
    if (mes) meses.push(mes)
  }

  const validos = meses.filter((mes) => /^\d{4}-\d{2}$/.test(mes)).sort()
  return validos[0] || mesActualStr()
}

async function calcularReporte(mes) {
  const [gastosDiarios, ingresosEfimeros, fijos] = await Promise.all([
    db.gastos_diarios.where('fecha').between(primerDiaMes(mes), finMesExclusivo(mes), true, false).toArray(),
    db.ingresos_efimeros.where('fecha').between(primerDiaMes(mes), finMesExclusivo(mes), true, false).toArray(),
    db.movimientos_fijos_mensuales.where('mes').equals(mes).toArray(),
  ])

  const totalGastosDiarios = gastosDiarios.reduce((s, g) => s + numero(g.monto), 0)
  const totalIngresosEfimeros = ingresosEfimeros.reduce((s, i) => s + numero(i.monto), 0)
  const totalIngresosFijos = fijos
    .filter((f) => f.tipo === 'ingreso')
    .reduce((s, f) => s + numero(f.monto_ars), 0)
  const totalGastosFijos = fijos
    .filter((f) => f.tipo === 'gasto')
    .reduce((s, f) => s + numero(f.monto_ars), 0)

  const totalIngresos = totalIngresosFijos + totalIngresosEfimeros
  const totalGastos = totalGastosFijos + totalGastosDiarios
  const diferencia = totalIngresos - totalGastos

  return {
    mes,
    total_ingresos_fijos: totalIngresosFijos,
    total_ingresos_efimeros: totalIngresosEfimeros,
    total_gastos_fijos: totalGastosFijos,
    total_gastos_diarios: totalGastosDiarios,
    total_ingresos: totalIngresos,
    total_gastos: totalGastos,
    diferencia,
    ahorro: diferencia,
    version: 2,
    createdAt: new Date().toISOString(),
  }
}

async function generarReportesPendientes() {
  const mesActual = mesActualStr()
  const hasta = mesAnteriorStr(mesActual)
  const desde = await primerMesConDatos()

  if (desde > hasta) return 0

  let generados = 0

  for (const mes of listarMeses(desde, hasta)) {
    const existente = await db.resumen_mensual.where('mes').equals(mes).first()
    if (existente) continue

    await db.resumen_mensual.add(await calcularReporte(mes))
    generados += 1
  }

  return generados
}

async function crearSnapshotsTransicion(mes, fechaCiclo) {
  const fechaCicloStr = fechaISO(fechaCiclo)

  const [ingresos, gastos, cotizacion] = await Promise.all([
    db.ingresos_fijos.where('activo').equals(1).toArray(),
    db.gastos_fijos.toArray(),
    obtenerCotizacionBlue(),
  ])

  const ahora = new Date().toISOString()
  const snapshots = []

  for (const ingreso of ingresos) {
    if (ingreso.mes_aplicado !== mes) continue
    const monto = numero(ingreso.monto)
    if (monto <= 0) continue

    snapshots.push({
      mes,
      tipo: 'ingreso',
      referenciaId: ingreso.id,
      nombre: ingreso.nombre || 'Ingreso fijo',
      monto,
      moneda: 'ARS',
      monto_ars: monto,
      cotizacion: 1,
      origen: 'migracion',
      createdAt: ahora,
    })
  }

  for (const gasto of gastos) {
    if (fechaCicloStr && gasto.createdAt && fechaISO(gasto.createdAt) > fechaCicloStr) continue
    if (gasto.tipo === 'cuotas' && (gasto.activo !== 1 || numero(gasto.cuotas_pagadas) <= 0)) continue
    if (gasto.tipo !== 'cuotas' && gasto.activo === 0) continue

    const monto = numero(gasto.monto)
    if (monto <= 0) continue

    const moneda = gasto.moneda || 'ARS'
    if (moneda === 'USD' && !cotizacion) continue

    const montoArs = convertirARS(monto, moneda, cotizacion)

    snapshots.push({
      mes,
      tipo: 'gasto',
      referenciaId: gasto.id,
      nombre: gasto.nombre || 'Gasto fijo',
      monto,
      moneda,
      monto_ars: montoArs,
      cotizacion: moneda === 'USD' ? cotizacion : 1,
      cuotas_pagadas: gasto.tipo === 'cuotas' ? numero(gasto.cuotas_pagadas) : null,
      origen: 'migracion',
      createdAt: ahora,
    })
  }

  if (snapshots.length > 0) {
    await db.movimientos_fijos_mensuales.bulkAdd(snapshots)
  }
}

async function migrarEstadoCierre() {
  const estado = await db.estado_cuenta.get(1)
  if (!estado || estado.mes_fijos_aplicado) return

  const mes = mesActualStr()
  const mesPrev = mesAnteriorStr(mes)

  const [snapshotsCount, reporteAnterior, ingresos] = await Promise.all([
    db.movimientos_fijos_mensuales.where('mes').equals(mes).count(),
    db.resumen_mensual.where('mes').equals(mesPrev).first(),
    db.ingresos_fijos.where('activo').equals(1).toArray(),
  ])

  const ingresosAplicados = ingresos.some((ingreso) => ingreso.mes_aplicado === mes)
  const yaAplicado = snapshotsCount > 0 || ingresosAplicados || Boolean(reporteAnterior)

  if (!yaAplicado) return

  if (snapshotsCount === 0) {
    await crearSnapshotsTransicion(mes, reporteAnterior?.createdAt || estado.updatedAt)
  }

  await db.estado_cuenta.update(1, {
    mes_fijos_aplicado: mes,
    updatedAt: new Date().toISOString(),
  })
}

async function aplicarFijosDelMes() {
  const mes = mesActualStr()
  const estado = await db.estado_cuenta.get(1)
  if (!estado) return { aplicado: false, delta: 0 }
  if (estado.mes_fijos_aplicado === mes) return { aplicado: false, delta: 0 }

  const [ingresos, gastos, cotizacion] = await Promise.all([
    db.ingresos_fijos.where('activo').equals(1).toArray(),
    db.gastos_fijos.where('activo').equals(1).toArray(),
    obtenerCotizacionBlue(),
  ])

  const gastosUSD = gastos.filter((gasto) => {
    if (gasto.moneda !== 'USD') return false
    if (gasto.tipo !== 'cuotas') return true
    return numero(gasto.cuotas_pagadas) < numero(gasto.total_cuotas)
  })

  if (gastosUSD.length > 0 && !cotizacion) {
    throw new Error('No hay cotización blue para aplicar gastos fijos en USD')
  }

  const ahora = new Date().toISOString()
  const snapshots = []
  const ingresosActualizar = []
  const gastosActualizar = []
  let delta = 0

  for (const ingreso of ingresos) {
    if (ingreso.mes_aplicado === mes) continue

    const monto = numero(ingreso.monto)
    if (monto <= 0) continue

    delta += monto
    ingresosActualizar.push({ id: ingreso.id, mes_aplicado: mes })
    snapshots.push({
      mes,
      tipo: 'ingreso',
      referenciaId: ingreso.id,
      nombre: ingreso.nombre || 'Ingreso fijo',
      monto,
      moneda: 'ARS',
      monto_ars: monto,
      cotizacion: 1,
      origen: 'cierre',
      createdAt: ahora,
    })
  }

  for (const gasto of gastos) {
    const pagadas = numero(gasto.cuotas_pagadas)
    const totalCuotas = numero(gasto.total_cuotas)

    if (gasto.tipo === 'cuotas' && pagadas >= totalCuotas) continue

    const monto = numero(gasto.monto)
    if (monto <= 0) continue

    const moneda = gasto.moneda || 'ARS'
    if (moneda === 'USD' && !cotizacion) continue

    const montoArs = convertirARS(monto, moneda, cotizacion)
    delta -= montoArs

    snapshots.push({
      mes,
      tipo: 'gasto',
      referenciaId: gasto.id,
      nombre: gasto.nombre || 'Gasto fijo',
      monto,
      moneda,
      monto_ars: montoArs,
      cotizacion: moneda === 'USD' ? cotizacion : 1,
      cuotas_pagadas: gasto.tipo === 'cuotas' ? pagadas + 1 : null,
      origen: 'cierre',
      createdAt: ahora,
    })

    if (gasto.tipo === 'cuotas') {
      const nuevasPagadas = pagadas + 1
      gastosActualizar.push({
        id: gasto.id,
        cuotas_pagadas: nuevasPagadas,
        ...(nuevasPagadas >= totalCuotas ? { activo: 0 } : {}),
      })
    }
  }

  let aplicadoTx = false

  await db.transaction('rw', db.ingresos_fijos, db.gastos_fijos, db.movimientos_fijos_mensuales, db.estado_cuenta, async () => {
    const estadoTx = await db.estado_cuenta.get(1)
    if (estadoTx?.mes_fijos_aplicado === mes) return

    const actual = numero(estadoTx?.total_en_mano)

    for (const item of ingresosActualizar) {
      await db.ingresos_fijos.update(item.id, { mes_aplicado: item.mes_aplicado })
    }

    for (const item of gastosActualizar) {
      const { id, ...data } = item
      await db.gastos_fijos.update(id, data)
    }

    if (snapshots.length > 0) {
      await db.movimientos_fijos_mensuales.bulkAdd(snapshots)
    }

    await db.estado_cuenta.update(1, {
      total_en_mano: actual + delta,
      mes_fijos_aplicado: mes,
      updatedAt: new Date().toISOString(),
    })
    aplicadoTx = true
  })

  return { aplicado: aplicadoTx, delta: aplicadoTx ? delta : 0 }
}

async function ejecutarCierre() {
  const estado = await db.estado_cuenta.get(1)
  if (!estado) return { reportesGenerados: 0, fijosAplicados: false, delta: 0 }

  await migrarEstadoCierre()

  const reportesGenerados = await generarReportesPendientes()
  const fijos = await aplicarFijosDelMes()

  return {
    reportesGenerados,
    fijosAplicados: fijos.aplicado,
    delta: fijos.delta,
  }
}

let ejecucion = null

export function ejecutarCierreMensual() {
  if (ejecucion) return ejecucion

  ejecucion = ejecutarCierre().finally(() => {
    ejecucion = null
  })

  return ejecucion
}
