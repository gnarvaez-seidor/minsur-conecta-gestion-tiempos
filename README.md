# btp-workzone-nextjs-template

Plantilla **Next.js 16 (static export)** lista para desplegar en **SAP Build Work Zone** vía el HTML5 Application Repository, y para **correr localmente** con `next dev`. Sigue el patrón canónico SeidorApps (App Router + `components/[módulo]` + `ui/` primitivos, Tailwind v4 + CSS variables, skeletons-not-spinners), con i18n EN/ES, auth BTP intercambiable y una vista CRUD de ejemplo.

## Quickstart (local, 100% offline)

```bash
npm install
cp .env.example .env.local      # default: NEXT_PUBLIC_AUTH_STRATEGY=mock
npm run dev                     # http://localhost:3000
```

En modo `mock` no necesitas backend, VPN ni Workzone: la vista CRUD corre con datos de ejemplo, EN/ES y light/dark funcionan.

## Modos de auth (`NEXT_PUBLIC_AUTH_STRATEGY`)

| Valor | Qué hace | Cuándo |
|---|---|---|
| `mock` | Sesión fake, datos mock, sin red | Dev/diseño offline |
| `seidor` | `/useridp` → `sToken` + headers Path A/B | Apps que fronteán el API Gateway SEIDOR |
| `xsuaa` | Sin intercambio; confía en el JWT del approuter | Backends CAP bound a XSUAA |

Para pegar datos reales en dev contra QAS, usa el preset incluido:

```bash
cp .env.qas.example .env.local   # rellena las 2 URLs (host de dest-apigateway / dest-apiseguridad de tu subaccount QAS)
npm run dev
# abre http://localhost:3000/#/login y pega un sToken (o el JSON de /useridp) de una sesión QAS viva
```

El proxy dev-only de `next.config.ts` reenvía `/dest-apigateway` y `/dest-apiseguridad` a esas URLs (sin CORS). Ver los comentarios de `.env.qas.example` para el detalle del flujo de auth local.

## Build estático + simulación de Workzone (sin desplegar)

```bash
npm run build                   # next build && relativize-export
# Simular el path versionado del App Repo (riesgo #1) sirviendo out/ desde un sub-path anidado:
(cd .. && npx serve .)          # abrir http://localhost:3000/btp-workzone-nextjs-template/out/
# DevTools Network: todos los _next + favicon deben dar 200 (rutas relativas)
```

## Despliegue a Workzone

```bash
npm ci && npm run build && npm run package:content   # static export + content zip (en la raíz)
mbt build -p=cf -t=mta_archives                       # empaqueta el MTA
cf deploy mta_archives/*.mtar
```

> El `package:content` es obligatorio antes de `mbt build`: mbt no auto-zipea el output del módulo html5, así que el content zip debe existir en la raíz (el deployer del MTA lo copia). El workflow `deploy.yml` ya hace estos pasos.

Luego registra la app como tile en Workzone. Ver el **checklist de spike** en el plan del proyecto antes de confiar en producción (assets bajo base versionada, deep-link reload, CSP del iframe, theme-bridge).

## CI/CD (GitHub Actions)

Dos workflows en `.github/workflows/`:

- **`ci.yml`** — en cada PR a `main` (y push a otras ramas): `npm ci` → `lint` → `build` (Next static export + relativize) → `verify:export` (guard de que el bundle es relativo y self-contained). Atrapa regresiones antes de mergear.
- **`deploy.yml`** — en push a `main` (o manual `workflow_dispatch`): instala CF CLI v8 + `mbt` + plugin `multiapps`, corre `mbt build` y `cf deploy` el `.mtar` al HTML5 App Repository.

### Configurar en GitHub → Settings → Secrets and variables → Actions

**Variables** (no sensibles):

| Variable | Ejemplo / valor |
|---|---|
| `CF_API` | `https://api.cf.eu10-004.hana.ondemand.com` |
| `CF_ORG` | tu org de Cloud Foundry |
| `CF_SPACE` | tu space (p.ej. `dev` / `qas`) |
| `CF_ORIGIN` | *(opcional)* define **sólo** si usas SSO/IAS corporativo |

**Secrets** (sensibles): `CF_USERNAME`, `CF_PASSWORD`.

### Notas

- **Auth:** si `CF_ORIGIN` está vacío → `cf auth` con usuario/contraseña del origin UAA por defecto (necesitas un **usuario técnico** con password). Si tu subaccount usa **SSO/IAS**, define `CF_ORIGIN` y usa un usuario IAS con contraseña.
- **Permisos:** el usuario de CF necesita rol **Space Developer** y permiso para crear instancias de servicio (`destination`, `html5-apps-repo`, `xsuaa`) en ese space.
- El build de CI/CD corre en modo producción → usa `.env.production` (`NEXT_PUBLIC_AUTH_STRATEGY=seidor`). No hay `.env.local` en el checkout limpio.
- Requiere `package-lock.json` commiteado (para `npm ci` + cache).
- Escalado futuro: mapear `dev/qas/prod` con **GitHub Environments** (branch→space + approvals).

## Renombrar para una app real

Reemplaza los placeholders `seidor.template.*` / `btp-workzone-nextjs-template` en: `package.json`, `mta.yaml`, `xs-security.json`, `public/manifest.json`, `public/Component.js` (namespace), y `NEXT_PUBLIC_APLICACION`.

Ver `CLAUDE.md` para las convenciones de arquitectura y las restricciones del static-export.
