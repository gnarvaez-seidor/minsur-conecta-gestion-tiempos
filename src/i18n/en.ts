// English dictionary. `es.ts` is typed against `Dictionary` (= typeof en), so any
// missing or extra key there fails the build. Keep both files in the same shape.
export const en = {
  common: {
    search: "Search",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    close: "Close",
    loading: "Loading…",
    new: "New",
    logout: "Log out",
    noResults: "No results found",
    all: "All",
    clear: "Clear",
    retry: "Retry",
    menu: "Open menu",
  },
  app: {
    name: "MINSUR Conecta",
    tagline: "Time Management",
  },
  nav: {
    roster: "Roster",
    profile: "My Profile",
    demo: "Demo E2E",
  },
  theme: {
    toggle: "Toggle theme",
    workzoneManaged: "Theme is managed by Workzone",
  },
  locale: {
    label: "Language",
    en: "EN",
    es: "ES",
  },
  auth: {
    sessionCheck: "Verifying session…",
    title: "Sign in",
    tokenLabel: "Paste a JWT or the /useridp JSON response",
    tokenPlaceholder: 'eyJhbGciOi…  or  { "sToken": … }',
    signIn: "Sign in",
    mockNotice: "Mock mode is active — you are signed in automatically.",
    invalidToken: "Could not parse the token.",
  },
};
