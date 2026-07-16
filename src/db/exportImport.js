import db from './index.js'

export async function exportarDatos() {
  const data = {}
  for (const table of db.tables) {
    data[table.name] = await table.toArray()
  }

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables: data,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  a.download = `zentro-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importarDatos(file) {
  const text = await file.text()

  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    throw new Error('El archivo no es un JSON válido')
  }

  if (!payload.version || !payload.tables) {
    throw new Error('El archivo no tiene el formato esperado (falta version o tables)')
  }

  const tables = [...db.tables]

  await db.transaction('rw', ...tables, async () => {
    for (const table of tables) {
      await table.clear()
      const rows = payload.tables[table.name]
      if (Array.isArray(rows) && rows.length > 0) {
        await table.bulkAdd(rows)
      }
    }
  })
}
