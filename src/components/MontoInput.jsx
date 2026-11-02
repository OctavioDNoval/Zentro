import { useRef } from 'react'
import { formatearMontoInput } from '../db/moneda.js'

function MontoInput({ value, onChange, ...props }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const input = e.target
    const raw = input.value
    const caret = input.selectionStart ?? raw.length
    const alFinal = caret >= raw.length
    const digitosAntes = raw.slice(0, caret).replace(/\D/g, '').length
    const formateado = formatearMontoInput(raw)

    onChange(formateado)

    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return

      if (alFinal) {
        const fin = formateado.length
        el.setSelectionRange(fin, fin)
        return
      }

      let pos = 0
      let vistos = 0
      while (pos < formateado.length && vistos < digitosAntes) {
        if (/\d/.test(formateado[pos])) vistos += 1
        pos += 1
      }

      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={handleChange}
      {...props}
    />
  )
}

export default MontoInput
