import Dexie from 'dexie'

const db = new Dexie('ZentroDB')

db.version(1).stores({
  ingresos_fijos: '++id, activo',
  ingresos_efimeros: '++id, fecha',
  gastos_fijos: '++id, activo, tipo',
  gastos_diarios: '++id, fecha, categoriaId',
  categorias: '++id',
  resumen_mensual: '++id, mes',
  estado_cuenta: 'id',
})

export default db
