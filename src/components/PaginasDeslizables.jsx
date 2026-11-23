import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { tabs, indiceDeRuta } from '../navegacion.js'

// Carrusel horizontal con scroll-snap nativo: las pestañas siguen el dedo y se
// acomodan solas al soltar. La URL se mantiene sincronizada con la pestaña visible.
// Se montan la pestaña actual, sus vecinas y las que ya se visitaron.
function PaginasDeslizables({ onIndiceVivo }) {
  const location = useLocation()
  const navigate = useNavigate()
  const contenedor = useRef(null)
  const timer = useRef(null)
  const primeraVez = useRef(true)
  const indiceRuta = indiceDeRuta(location.pathname)
  const [visitados, setVisitados] = useState(() => new Set([indiceRuta]))

  const montar = (i) => {
    setVisitados((prev) => {
      if (prev.has(i)) return prev
      const next = new Set(prev); next.add(i); return next
    })
  }

  // La ruta cambió (toque en la barra o carga inicial): llevar el carrusel ahí
  useLayoutEffect(() => {
    const el = contenedor.current
    if (!el) return
    const destino = indiceRuta * el.clientWidth
    if (Math.abs(el.scrollLeft - destino) < 2) { primeraVez.current = false; return }
    const actual = Math.round(el.scrollLeft / el.clientWidth)
    const suave = !primeraVez.current && Math.abs(actual - indiceRuta) <= 1
    primeraVez.current = false
    el.scrollTo({ left: destino, behavior: suave ? 'smooth' : 'instant' })
  }, [indiceRuta])

  // Mantener la posición al rotar o cambiar el tamaño de la ventana
  useEffect(() => {
    const onResize = () => {
      const el = contenedor.current
      if (el) el.scrollTo({ left: indiceDeRuta(window.location.pathname) * el.clientWidth, behavior: 'instant' })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const asentar = () => {
    const el = contenedor.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== indiceDeRuta(window.location.pathname)) navigate(tabs[i].path)
  }

  const onScroll = () => {
    const el = contenedor.current
    const i = Math.round(el.scrollLeft / el.clientWidth)
    onIndiceVivo?.(i)
    montar(i)
    if (i > 0) montar(i - 1)
    if (i < tabs.length - 1) montar(i + 1)
    clearTimeout(timer.current)
    timer.current = setTimeout(asentar, 120)
  }

  return (
    <main ref={contenedor} onScroll={onScroll}
      className="flex-1 min-h-0 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ overscrollBehaviorX: 'contain' }}>
      {tabs.map(({ path, Pagina }, i) => {
        const visible = visitados.has(i) || Math.abs(i - indiceRuta) <= 1
        return (
          <section key={path} aria-hidden={i !== indiceRuta}
            className="w-full h-full shrink-0 snap-start [scroll-snap-stop:always] overflow-y-auto overscroll-y-contain px-4 py-5 pb-28">
            {visible && <Pagina />}
          </section>
        )
      })}
    </main>
  )
}

export default PaginasDeslizables
