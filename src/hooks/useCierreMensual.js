import { useEffect, useRef } from 'react'
import { ejecutarCierreMensual } from '../db/ciclo-mensual.js'

function pad(n) {
  return String(n).padStart(2, '0')
}

function mesActualStr() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}`
}

function msHastaManana() {
  const ahora = new Date()
  const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 1)
  return manana.getTime() - ahora.getTime()
}

export function useCierreMensual() {
  const mesRef = useRef(mesActualStr())

  useEffect(() => {
    let cancelado = false
    let timeoutId = null
    let intervalId = null

    const ejecutar = async () => {
      try {
        const resultado = await ejecutarCierreMensual()
        if (!cancelado && (resultado.reportesGenerados > 0 || resultado.fijosAplicados)) {
          window.dispatchEvent(new CustomEvent('zentro:data-changed'))
        }
      } catch (err) {
        console.error('Error ejecutando cierre mensual:', err)
      }
    }

    const chequearMes = () => {
      const mes = mesActualStr()
      if (mes !== mesRef.current) {
        mesRef.current = mes
        ejecutar()
      }
    }

    const programarMedianoche = () => {
      timeoutId = setTimeout(() => {
        if (cancelado) return
        chequearMes()
        programarMedianoche()
      }, msHastaManana())
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') chequearMes()
    }

    ejecutar()
    programarMedianoche()
    intervalId = setInterval(chequearMes, 60000)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelado = true
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
}
