import type { Dictionary } from "./types";

// Spanish dictionary — typed against `Dictionary` so it must match en.ts exactly.
export const es: Dictionary = {
  common: {
    search: "Buscar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    delete: "Eliminar",
    close: "Cerrar",
    loading: "Cargando…",
    new: "Nuevo",
    logout: "Cerrar sesión",
    noResults: "No se encontraron resultados",
    all: "Todos",
    clear: "Limpiar",
    retry: "Reintentar",
    menu: "Abrir menú",
  },
  app: {
    name: "MINSUR Conecta",
    tagline: "Gestión de Tiempos",
  },
  nav: {
    roster: "Roster",
    profile: "Mi Perfil",
    demo: "Demo E2E",
  },
  theme: {
    toggle: "Cambiar tema",
    workzoneManaged: "El tema lo gestiona Workzone",
  },
  locale: {
    label: "Idioma",
    en: "EN",
    es: "ES",
  },
  auth: {
    sessionCheck: "Verificando sesión…",
    title: "Iniciar sesión",
    tokenLabel: "Pega un JWT o la respuesta JSON de /useridp",
    tokenPlaceholder: 'eyJhbGciOi…  o  { "sToken": … }',
    signIn: "Iniciar sesión",
    mockNotice: "Modo mock activo — sesión iniciada automáticamente.",
    invalidToken: "No se pudo interpretar el token.",
  },
};
