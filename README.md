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
| React Router DOM 7 | Rutas |
| Lucide React | Iconos |

## UI / UX

- **Tema claro/oscuro** con paleta naranja (`dark` class via CSS custom properties)
- **Toggle de tema** en Configuración (engranaje en header)
- **Bottom tab bar flotante** con backdrop-blur, botón central `+` y animaciones
- **Splash screen** con zoom in/out animado mientras se inicializa la DB
- **Animaciones**: `fade-in-up`, `scale-in`, `slide-up`, shimmer en skeletons
- **Skeletons** de carga por página
- **Swipe to delete** en gastos diarios
- **Iconos Lucide** en toda la interfaz
- **Mobile-first**, responsive

## Estructura

```
src/
  components/
    Layout.jsx                  ← Header + tab bar flotante + modales globales
    Modal.jsx                   ← Modal reutilizable
    SplashScreen.jsx            ← Animación de apertura
    SettingsModal.jsx           ← Tema claro/oscuro + export/import
    InfoModal.jsx               ← Información de la app
    InstallModal.jsx            ← Prompt de instalación PWA
    InstallPWA.jsx              ← Botón flotante de instalación
    AnimatedNumber.jsx          ← Números animados con formato
    Skeleton.jsx                ← Skeletons de carga
    SwipeToDelete.jsx           ← Wrapper de swipe para eliminar
    IngresoFijoModal.jsx        ← Alta de ingreso fijo
    IngresoFijoEditModal.jsx    ← Edición / borrado de ingreso fijo
    IngresoEfimeroModal.jsx     ← Alta de ingreso único
    IngresoEfimeroEditModal.jsx ← Edición / borrado de ingreso único
    GastoDiarioModal.jsx        ← Alta de gasto diario
    GastoEditModal.jsx          ← Edición / borrado de gasto diario
    GastoFijoModal.jsx          ← Alta de gasto fijo (ARS/USD)
    GastoFijoEditModal.jsx      ← Edición / borrado de gasto fijo
    CategoriaModal.jsx          ← Alta de categoría
    AhorroModal.jsx             ← Alta de ahorro (ARS/USD)
    AhorroEditModal.jsx         ← Edición / borrado de ahorro
  pages/
    Plantilla.jsx               ← Ingresos fijos + únicos + resumen
    Gastos.jsx                  ← Gastos fijos + gastos diarios
    Ahorros.jsx                 ← Ahorros + cotizaciones USD
    Dashboard.jsx               ← Historial mensual
  db/
    index.js                    ← Schema Dexie
    seed.js                     ← Categorías + estado inicial
    ciclo-mensual.js            ← Cierre de mes automático
    estado-cuenta.js            ← Actualización centralizada del total
    moneda.js                   ← Cotizaciones, conversión y formateo
    exportImport.js             ← Backup / restauración JSON
  App.jsx                       ← Splash + dark mode + rutas
  main.jsx                      ← Entry point + seed + ciclo
```

## Tablas (Dexie.js)

**v2**

| Tabla | Índices | Descripción |
|---|---|---|
| `ingresos_fijos` | `++id, activo` | Sueldos/ingresos recurrentes con día de cobro |
| `ingresos_efimeros` | `++id, fecha` | Ingresos de una sola vez |
| `gastos_fijos` | `++id, activo, tipo` | Suscripciones, servicios, cuotas (ARS/USD) |
| `gastos_diarios` | `++id, fecha, categoriaId` | Gastos del día a día |
| `categorias` | `++id` | Sin categoría, Comida, Ocio, Auto, etc. |
| `resumen_mensual` | `++id, mes` | Snapshot histórico mensual |
| `estado_cuenta` | `id` (singleton) | Total en mano actual |

**v3**

| Tabla | Índices | Descripción |
|---|---|---|
| `ahorros` | `++id, moneda` | Ahorros en ARS/USD (opcionalmente descontados del total) |
| `cotizaciones` | `casa` | Última cotización conocida de cada dólar (caché) |

> **Versión de esquema:** Dexie v3. No hay migración `up()`: las tablas v2 se conservan y solo se agregan las nuevas.

## Ciclo mensual automático

Al iniciar la app (`main.jsx` → `ejecutarCicloMensual`), si no existe el resumen del mes anterior:

1. Genera `resumen_mensual` del mes anterior (ingresos/gastos fijos, diarios y ahorro)
2. Procesa gastos fijos (cuotas: incrementa `cuotas_pagadas` y desactiva al completar)
3. Aplica ingresos fijos una sola vez por mes (`mes_aplicado`)
4. Actualiza `estado_cuenta.total_en_mano`
5. Limpia `gastos_diarios`

También ejecuta una limpieza única de resúmenes viejos (`resumenes_migrados`).

## Cotizaciones y moneda

- Fuente: [`dolarapi.com/v1/dolares`](https://dolarapi.com/v1/dolares)
- Casas soportadas: `blue`, `oficial`, `mep`, `ccl`
- Se guardan en caché en `cotizaciones`; si el fetch falla se usa la última copia
- La página **Ahorros** refresca cada 5 minutos y permite actualizar manualmente
- Los gastos fijos en USD se convierten a ARS con el **blue venta**

## Navegación

| Tab | Ruta | Contenido |
|---|---|---|
| Plantilla | `/` | Ingresos fijos + ingresos únicos, cards gastado/total, barra de gastos y alerta al 80% |
| Gastos | `/gastos` | Gastos fijos activos + gastos diarios con búsqueda y swipe-to-delete |
| Ahorros | `/ahorros` | Cotizaciones USD + ahorros en ARS/USD y totales convertidos |
| Dashboard | `/dashboard` | Historial de cierres mensuales |

El botón central `+` de la tab bar abre el modal de **gasto diario** desde cualquier pantalla.

## Datos locales

- Toda la información vive en IndexedDB (`ZentroDB`). No hay servidor ni cuenta.
- **Configuración → Exportar datos** descarga `zentro-backup-YYYY-MM-DD.json` con todas las tablas.
- **Configuración → Importar datos** reemplaza el contenido actual (pide confirmación).
- El total en mano se mantiene vía `actualizarTotal(delta)` en `db/estado-cuenta.js` para evitar desincronizaciones.
- Los cambios de datos disparan el evento `zentro:data-changed` para refrescar las vistas.

## Comandos

```bash
npm install      # Instalar dependencias
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
npm run lint     # ESLint
```
