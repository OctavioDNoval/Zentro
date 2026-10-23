import { useEffect, useMemo, useState } from 'react'
import { calcularSugerencias, obtenerCandidatosGastoDiario, obtenerCandidatosIngresoEfimero } from '../db/sugerencias.js'

const CARGADORES = {
  'gasto-diario': obtenerCandidatosGastoDiario,
  'ingreso-efimero': obtenerCandidatosIngresoEfimero,
}

export function useSugerenciasMonto({ tipo, concepto, isOpen, limite = 5 }) {
  const [candidatos, setCandidatos] = useState([])

  useEffect(() => {
    if (!isOpen) return
    const cargar = CARGADORES[tipo]
    if (!cargar) return

    let cancelado = false
    cargar().then((data) => {
      if (!cancelado) setCandidatos(data)
    })

    return () => { cancelado = true }
  }, [isOpen, tipo])

  return useMemo(() => calcularSugerencias(candidatos, concepto, limite), [candidatos, concepto, limite])
}
