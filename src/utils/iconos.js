import {
  ShoppingCart, Utensils, Car, Clapperboard, Zap, Bus, HeartPulse, GraduationCap, House, Tag,
  Package, Briefcase, Repeat, CreditCard, Coins, Shirt, PawPrint, Plane, Gift, Smartphone,
} from 'lucide-react'

// Coincidencia por palabra clave en el nombre de la categoría (las categorías las crea el usuario)
const REGLAS = [
  [/super|almac|mercado|verdul/, ShoppingCart, '#16a34a'],
  [/comida|resto|delivery|almuerzo|cena|caf/, Utensils, '#ea580c'],
  [/auto|nafta|combust|estacion/, Car, '#2563eb'],
  [/ocio|cine|salida|entreten|juego/, Clapperboard, '#db2777'],
  [/servicio|luz|gas|agua|internet/, Zap, '#d97706'],
  [/transp|colectivo|subte|uber|taxi|tren/, Bus, '#0891b2'],
  [/salud|farmac|medic/, HeartPulse, '#dc2626'],
  [/educa|curso|facu|colegio|libro/, GraduationCap, '#7c3aed'],
  [/hogar|casa|alquiler|expensa/, House, '#0d9488'],
  [/ropa|indument/, Shirt, '#c026d3'],
  [/mascota|veterin/, PawPrint, '#a16207'],
  [/viaje|vacacion/, Plane, '#0284c7'],
  [/regalo/, Gift, '#e11d48'],
  [/celu|tecno|telefon/, Smartphone, '#4f46e5'],
  [/otro/, Package, '#78716c'],
]

const TIPOS = {
  suscripcion: [Repeat, '#2563eb'],
  servicio: [Zap, '#d97706'],
  cuotas: [CreditCard, '#7c3aed'],
  sueldo: [Briefcase, '#16a34a'],
  ingreso: [Coins, '#16a34a'],
}

export function estiloCategoria(nombre = '') {
  const n = nombre.toLowerCase()
  const regla = REGLAS.find(([re]) => re.test(n))
  return regla ? { Icon: regla[1], color: regla[2] } : { Icon: Tag, color: '#78716c' }
}

export function estiloTipo(tipo) {
  const [Icon, color] = TIPOS[tipo] ?? [Tag, '#78716c']
  return { Icon, color }
}
