import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next 16 flat-config entry points (no FlatCompat / @eslint/eslintrc needed).
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // public/ holds the UI5 Workzone wrapper (Component.js) and static assets — not app source.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "public/**"]),
  {
    rules: {
      // We intentionally read browser-only state (theme/locale/hash) and kick off data
      // fetches inside a mount effect — the SSR/static-export-safe pattern. The React
      // Compiler rule flags the synchronous setState; keep it visible as a warning, not a
      // hard error (these run once on mount; no harmful cascading renders).
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
