import { useState, useRef } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function CategoriaModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const handleClose = () => {
    setNombre('')
    setError('')
    setSaving(false)
    savingRef.current = false
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (savingRef.current) return

    const nombreLimpiado = nombre.trim()
    if (!nombreLimpiado) {
      setError('Ingresá un nombre')
      return
    }

    setError('')
    try {
      setSaving(true)
      savingRef.current = true
      await db.categorias.add({ nombre: nombreLimpiado })
      await onSaved?.()
      handleClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al crear categoría')
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva categoría">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre de la categoría" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 btn-primary rounded-xl py-2.5 text-sm cursor-pointer disabled:cursor-default"
          style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}>
          <Plus size={16} /> {saving ? 'Creando…' : 'Crear'}
        </button>
      </form>
    </Modal>
  )
}

export default CategoriaModal
