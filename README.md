# Zentro

App de control de gastos personales, offline-first, sin backend. Construida con React + Vite + Tailwind CSS + Dexie.js.

## Stack

| Tecnología | Uso |
|---|---|
| React 19 | UI |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Estilos mobile-first |
| Dexie.js | Base de datos local (IndexedDB) |
| vite-plugin-pwa | Service worker, manifest, offline |
| React Router DOM | Rutas |

## Estructura del proyecto

```
src/
  components/
    Layout.jsx          ← Header + Bottom tabs + Outlet
    Modal.jsx           ← Modal reutilizable
    InstallPWA.jsx      ← Botón de instalación PWA
    IngresoFijoModal.jsx
    IngresoEfimeroModal.jsx
    GastoDiarioModal.jsx
    GastoFijoModal.jsx
    GastoEditModal.jsx  ← Editar categoría / eliminar gasto diario
    CategoriaModal.jsx
  pages/
    Plantilla.jsx       ← Ingresos + resumen del mes
    Gastos.jsx          ← Gastos diarios + gastos fijos
    Dashboard.jsx       ← Historial mensual
  db/
    index.js            ← Schema Dexie (7 tablas)
    seed.js             ← Categorías predeterminadas
    ciclo-mensual.js    ← Cierre de mes automático
  App.jsx               ← Rutas
  main.jsx              ← Entry point
```

## Base de datos (Dexie.js)

### Tablas

| Tabla | Índices | Descripción |
|---|---|---|
| `ingresos_fijos` | `++id, activo` | Sueldos/ingresos recurrentes con día de cobro configurable |
| `ingresos_efimeros` | `++id, fecha` | Ingresos de una sola vez (freelance, transferencias, etc.) |
| `gastos_fijos` | `++id, activo, tipo` | Suscripciones, servicios y cuotas (con seguimiento de pagos) |
| `gastos_diarios` | `++id, fecha, categoriaId` | Gastos del día a día (se limpia cada mes) |
| `categorias` | `++id` | Sin categoría, Comida, Ocio, Auto, Supermercado, etc. |
| `resumen_mensual` | `++id, mes` | Snapshot histórico de cada mes |
| `estado_cuenta` | `id` | Singleton con el total en mano actual |

### Lógica automática

Al iniciar la app, `main.jsx` ejecuta:

1. **Seed**: si es la primera vez, crea las categorías predefinidas y el estado de cuenta inicial.
2. **Ciclo mensual**: si detecta que cambió de mes, genera automáticamente el resumen del mes anterior:
   - Calcula gastos diarios del mes
   - Procesa ingresos fijos activos
   - Procesa gastos fijos (suscripciones/servicios siempre; cuotas: incrementa `cuotas_pagadas` y desactiva si se completaron)
   - Limpia la tabla `gastos_diarios`
   - Guarda el resumen en `resumen_mensual`
   - Actualiza `estado_cuenta.total_en_mano`

## PWA

- Service worker generado con Workbox (precache de todos los assets)
- Manifest con íconos SVG
- Componente `InstallPWA`: escucha el evento `beforeinstallprompt` y muestra un botón flotante para instalar la app si no está instalada

## Navegación

| Tab | Ruta | Contenido |
|---|---|---|
| 🏠 Plantilla | `/` | Ingresos fijos + ingresos efímeros + cards de resumen (gastado, restante, total en mano) |
| 💳 Gastos | `/gastos` | Gastos diarios del mes (editables) + gastos fijos activos |
| 📊 Dashboard | `/dashboard` | Historial de cierres mensuales |

## Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
```
