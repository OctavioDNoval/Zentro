import Dexie from 'dexie'

const db = new Dexie('ZentroDB')

db.version(1).stores({
  gastos: '++id, fecha, categoria, createdAt',
})

export default db
