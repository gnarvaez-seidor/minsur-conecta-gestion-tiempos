# CLAUDE.md — btp-workzone-nextjs-template

Plantilla Next.js 16 (App Router, **static export**) para SAP Build Work Zone, con el patrón canónico SeidorApps. Lee esto antes de tocar código.

## Restricciones del static-export (NO romper)

El bundle se sirve como **estático** desde el HTML5 App Repo bajo un path versionado desconocido (`/<appHostId>~<svc>/<id>-<version>/`). Por eso:

1. **Hash routing, no path routing.** Una sola ruta real (`src/app/page.tsx` shell `'use client'`); la navegación entre vistas es por `location.hash` (`useHashRoute`). NO usar `next/link` para navegar entre vistas, NO crear rutas `app/**/page.tsx` adicionales que dependan de SPA-fallback (el approuter no tiene `try_files`).
2. **NO setear `basePath`/`assetPrefix`.** Los assets se relativizan post-build (`scripts/relativize-export.mjs`, corre en `npm run build`). NO usar `next/dynamic` con publicPath absoluto (los chunks dinámicos no quedan en el HTML y romperían bajo la base versionada).
2b. **Build con `next build --webpack`, NUNCA Turbopack.** Turbopack genera nombres de chunk con `~` (p.ej. `03~yq9q893hmn.js`, `turbopack-...~....js`) que **colisionan con el cache-buster `~<hash>~` del HTML5 App Repository de SAP** → esos `.js` se sirven mal (404 / `text/plain` → "Refused to execute script") y **React nunca hidrata en Workzone** (se queda en "Verifying session…" para siempre, aunque local funcione). Webpack genera nombres `name-hash.js` repo-safe. El script `build` ya usa `--webpack`; no lo quites.
3. **Cliente puro.** `output:'export'` prohíbe middleware, Server Actions, route handlers dinámicos, `cookies()/headers()`, ISR. Todo el data-fetching es client-side vía `httpClient`.
4. **`images.unoptimized: true`** (sin optimizer en export). Self-host todo (CSP del iframe).
5. `rewrites()` en `next.config.ts` está **guardado a dev** (ausente del build de producción).

## Convenciones de diseño (de SeidorApps — obligatorias)

- **CSS variables, NUNCA hardcode.** Usa `bg-[var(--card)]`, `text-[var(--foreground)]`, `text-[var(--muted)]`, `border-[var(--card-border)]`, `bg-[var(--background)]`. NUNCA `bg-white dark:bg-gray-900`.
- **Skeletons, no spinners.** Usa los primitivos de `src/components/ui/Skeleton.tsx` (`animate-shimmer`).
- **Hover:** `.card-hover` (cards clickeables), `.stat-card` (KPIs), `.row-hover` (filas de tabla). No inline hover.
- **Iconos:** `react-icons/fi` (Feather) en todo.
- **Overlays con portal (OBLIGATORIO).** Todo overlay full-viewport (`position: fixed` que cubre pantalla: modal, dialog, confirm, drawer, panel lateral, toast) DEBE renderizarse vía `createPortal` a `document.body` — usa el primitivo `src/components/ui/Portal.tsx`, o los primitivos ya portalizados `ui/Modal.tsx` / `ui/ConfirmDialog.tsx`. Motivo: la app usa `transform` (`animate-fade-in-up`, `animate-scale-in`, …) por todos lados y **un ancestro transformado se vuelve el containing block de los descendientes `fixed`**, así que un `fixed inset-0` sin portal se ancla a un subárbol y no cubre el viewport. Contrato del overlay bespoke: `role="dialog"`+`aria-modal`, cierre por Esc, clic en backdrop, `body` scroll-lock, manejo de foco y `prefers-reduced-motion`.
- **Tailwind v4 CSS-first:** NO hay `tailwind.config.js`. Tokens en `globals.css` via `@theme inline`; CSS vars en `:root`/`.dark`.
- Excepción documentada: el look "management/data-table" (grays explícitos + acento púrpura) es la única excepción sancionada; las vistas de la app NO la usan (modelan la regla por defecto con CSS-vars).

## Estado

- **Context** (transversal): `AuthContext`, `WorkzoneThemeContext`, `I18nContext`.
- **Redux Toolkit** (UI/dominio): `store/slices/uiSlice.ts` (`searchQuery`, `density`) — slice de ejemplo (sin consumidor tras retirar `records`); se conserva como referencia del store. Usa `useAppSelector`/`useAppDispatch` de `store/hooks.ts`.

## Auth (`src/auth/`)

Abstracción `AuthStrategy` (interfaz) + 3 estrategias (`seidor` | `xsuaa` | `mock`) elegidas por `NEXT_PUBLIC_AUTH_STRATEGY`. El `httpClient` es "tonto": delega en `activeStrategy.decorateRequest()`. Para cambiar de backend, cambia el env — no toques vistas ni services. `NEXT_PUBLIC_APLICACION` = el header `aplicacion` (rename por app).

## i18n

`I18nContext` + diccionarios `src/i18n/{en,es}.ts` (mismo shape; `es` tipado contra `Dictionary` → claves faltantes fallan el build). `useTranslation()` → `t('nav.roster')` con claves tipadas. NO next-intl.

## Tema (requisito nube + local)

`WorkzoneThemeContext` es la única fuente de verdad del tema y togglea `.dark` en `<html>`. En Workzone: `?wzTheme` (carga) + postMessage de `Component.js` (runtime). Fuera de Workzone: por defecto **light** (dark es opt-in, NO sigue el `prefers-color-scheme` del SO) + toggle manual + sessionStorage.

## Patrón de vista (gold standard: `src/components/roster/`)

`app/page.tsx` (shell) → `RosterView.tsx` (orquestador fino) → `hooks/` (datos/derivados/paginación) + `components/` + `modals/`. El detalle/acción es un **Modal**, no una ruta. La paginación reutilizable vive en `src/hooks/usePagination.ts` + `src/components/ui/Pagination.tsx` (compartida por las vistas).

## Renombrar por app

Placeholders a reemplazar: `seidor.template.*`, `btp-workzone-nextjs-template`, `TemplateAccess`, `btpTemplate`. Archivos: `package.json`, `mta.yaml`, `xs-security.json`, `public/manifest.json`, `public/Component.js`, `.env.production`.
