# Zentro

App de control de gastos personales, offline-first, sin backend.

## Stack

| Tecnología | Uso |
|---|---|
| React 19 | UI |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Estilos mobile-first |
| Dexie.js | Base de datos local (IndexedDB) |
| vite-plugin-pwa | Service worker, manifest, offline |
| React Router DOM | Rutas |
| Lucide React | Iconos |

## UI / UX

- **Tema oscuro** con paleta azul (`dark` class via CSS custom properties)
- **Toggle claro/oscuro** en Configuración (engranaje en header)
- **Bottom tab bar flotante** con backdrop-blur y animaciones
- **Splash screen** con zoom in/out animado al abrir la app
- **Iconos Lucide** en toda la interfaz
- **Mobile-first**, responsive

## Estructura

```
src/
  components/
    Layout.jsx              ← Header + tab bar flotante + Settings
    Modal.jsx               ← Modal reutilizable
    SplashScreen.jsx        ← Animación de apertura
    SettingsModal.jsx       ← Toggle claro/oscuro
    InstallPWA.jsx          ← Botón de instalación PWA
    IngresoFijoModal.jsx    ← Modal alta ingreso fijo
    IngresoEfimeroModal.jsx ← Modal alta ingreso único
    GastoDiarioModal.jsx    ← Modal alta gasto diario
    GastoFijoModal.jsx      ← Modal alta gasto fijo
    GastoEditModal.jsx      ← Editar categoría / eliminar gasto
    CategoriaModal.jsx      ← Crear categoría
  pages/
    Plantilla.jsx           ← Ingresos fijos + efímeros + resumen
    Gastos.jsx              ← Gastos diarios + gastos fijos
    Dashboard.jsx           ← Historial mensual
  db/
    index.js                ← Schema Dexie (7 tablas)
    seed.js                 ← Categorías + estado inicial
    ciclo-mensual.js        ← Cierre de mes automático
  App.jsx                   ← Splash + dark mode + rutas
  main.jsx                  ← Entry point + seed + ciclo
```

## Tablas (Dexie.js)

| Tabla | Índices | Descripción |
|---|---|---|
| `ingresos_fijos` | `++id, activo` | Sueldos/ingresos recurrentes con día de cobro |
| `ingresos_efimeros` | `++id, fecha` | Ingresos de una sola vez |
| `gastos_fijos` | `++id, activo, tipo` | Suscripciones, servicios, cuotas |
| `gastos_diarios` | `++id, fecha, categoriaId` | Gastos del día a día |
| `categorias` | `++id` | Sin categoría, Comida, Ocio, Auto, etc. |
| `resumen_mensual` | `++id, mes` | Snapshot histórico mensual |
| `estado_cuenta` | `id` (singleton) | Total en mano actual |

## Ciclo mensual automático

Al iniciar la app, si detecta cambio de mes:
1. Genera resumen del mes anterior
2. Procesa ingresos/gastos fijos (cuotas: incrementa y desactiva al completar)
3. Limpia `gastos_diarios`
4. Actualiza `estado_cuenta.total_en_mano`

## Navegación

| Tab | Ruta | Contenido |
|---|---|---|
| Plantilla | `/` | Ingresos fijos + ingresos efímeros + cards gastado/restante/total |
| Gastos | `/gastos` | Gastos diarios (editables) + gastos fijos activos |
| Dashboard | `/dashboard` | Historial de cierres mensuales |

## Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
```
