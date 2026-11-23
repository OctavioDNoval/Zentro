const diasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const mesesCortos = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const pad = (n) => String(n).padStart(2, '0')
const aStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// "Hoy", "Ayer" o "Lun 18 nov"
export function etiquetaDia(fecha) {
  const clave = (fecha ?? '').split('T')[0]
  const hoy = new Date()
  const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1)
  if (clave === aStr(hoy)) return 'Hoy'
  if (clave === aStr(ayer)) return 'Ayer'
  const [y, m, d] = clave.split('-').map(Number)
  if (!y) return 'Sin fecha'
  const f = new Date(y, m - 1, d)
  return `${diasCortos[f.getDay()]} ${d} ${mesesCortos[m - 1]}`
}

// Agrupa items por día (más reciente primero) con subtotal de `monto`
export function agruparPorFecha(items) {
  const grupos = new Map()
  for (const it of items) {
    const clave = (it.fecha ?? '').split('T')[0]
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(it)
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, lista]) => ({
      fecha,
      etiqueta: etiquetaDia(fecha),
      items: lista,
      total: lista.reduce((s, i) => s + (Number(i.monto) || 0), 0),
    }))
}
