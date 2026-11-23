import { estiloCategoria, estiloTipo } from '../utils/iconos.js'

function IconoMovimiento({ categoria, tipo, size = 40 }) {
  const { Icon, color } = tipo ? estiloTipo(tipo) : estiloCategoria(categoria)
  return (
    <div className="flex items-center justify-center rounded-xl shrink-0"
      style={{ width: size, height: size, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
      <Icon size={Math.round(size * 0.45)} style={{ color }} strokeWidth={2} />
    </div>
  )
}

export default IconoMovimiento
