import db from './index.js'

export function normalizarConcepto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function mapearCandidatos(rows, campoConcepto) {
  return rows
    .map((row) => ({
      concepto: row[campoConcepto],
      monto: Number(row.monto),
      fecha: String(row.fecha || row.createdAt || ''),
    }))
    .filter((row) => Number.isFinite(row.monto) && row.monto > 0)
}

export async function obtenerCandidatosGastoDiario() {
  try {
    const hoy = new Date()
    const m = hoy.getMonth(); const y = hoy.getFullYear()
    const inicioStr = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const finStr = m === 11 ? `${y + 1}-01-01` : `${y}-${String(m + 2).padStart(2, '0')}-01`
    const rows = await db.gastos_diarios.where('fecha').between(inicioStr, finStr, true, false).toArray()
    return mapearCandidatos(rows, 'concepto')
  } catch (err) {
    console.error('Error cargando sugerencias de gastos:', err)
    return []
  }
}

export async function obtenerCandidatosIngresoEfimero() {
  try {
    const rows = await db.ingresos_efimeros.orderBy('fecha').reverse().limit(500).toArray()
    return mapearCandidatos(rows, 'nombre')
  } catch (err) {
    console.error('Error cargando sugerencias de ingresos:', err)
    return []
  }
}

function nivelCoincidencia(concepto, consulta) {
  if (!consulta) return 0
  if (concepto === consulta) return 3
  if (concepto.startsWith(consulta)) return 2
  if (concepto.split(' ').some((palabra) => palabra.startsWith(consulta))) return 1
  return 0
}

export function calcularSugerencias(candidatos, concepto, limite = 5) {
  const consulta = normalizarConcepto(concepto)
  const grupos = new Map()

  for (const candidato of candidatos) {
    const monto = Number(candidato.monto)
    if (!Number.isFinite(monto) || monto <= 0) continue

    const key = monto.toFixed(2)
    const nivel = nivelCoincidencia(normalizarConcepto(candidato.concepto), consulta)
    const fecha = candidato.fecha || ''
    const actual = grupos.get(key)

    if (actual) {
      actual.usos += 1
      actual.nivel = Math.max(actual.nivel, nivel)
      if (fecha > actual.fecha) actual.fecha = fecha
    } else {
      grupos.set(key, { monto, usos: 1, nivel, fecha })
    }
  }

  let items = [...grupos.values()]

  if (consulta) {
    const contextuales = items.filter((item) => item.nivel > 0)
    if (contextuales.length > 0) items = contextuales
  }

  return items
    .sort((a, b) => b.nivel - a.nivel || b.usos - a.usos || b.fecha.localeCompare(a.fecha))
    .slice(0, limite)
    .map(({ monto, usos }) => ({ monto, usos }))
}
