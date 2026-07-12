import db from './index.js'

const CATEGORIAS_PREDEFINIDAS = [
  { id: 1, nombre: 'Sin categoría' },
  { id: 2, nombre: 'Comida' },
  { id: 3, nombre: 'Supermercado' },
  { id: 4, nombre: 'Ocio' },
  { id: 5, nombre: 'Auto' },
  { id: 6, nombre: 'Servicio' },
  { id: 7, nombre: 'Transporte' },
  { id: 8, nombre: 'Salud' },
  { id: 9, nombre: 'Educación' },
  { id: 10, nombre: 'Hogar' },
  { id: 11, nombre: 'Otros' },
]

export async function seedDatabase() {
  const count = await db.categorias.count()
  if (count > 0) return

  await db.categorias.bulkAdd(CATEGORIAS_PREDEFINIDAS)

  await db.estado_cuenta.put({ id: 1, total_en_mano: 0, updatedAt: new Date() })
}
