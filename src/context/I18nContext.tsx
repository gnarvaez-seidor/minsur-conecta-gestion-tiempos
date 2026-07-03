"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";
import type { Dictionary, Locale, TKey } from "@/i18n/types";

const DICTS: Record<Locale, Dictionary> = { en, es };

/** Deterministic default for SSG/hydration; refined on the client in useEffect. */
function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem("locale");
    if (stored === "en" || stored === "es") return stored;
    const wz = new URLSearchParams(window.location.search).get("wzLang");
    if (wz === "en" || wz === "es") return wz;
    if (navigator.language?.toLowerCase().startsWith("es")) return "es";
  } catch {
    /* ignore */
  }
  return "en";
}

function getByPath(dict: Dictionary, key: string): string {
  const val = key
    .split(".")
    .reduce<unknown>((acc, k) => (acc == null ? acc : (acc as Record<string, unknown>)[k]), dict);
  if (typeof val === "string") return val;
  if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key: ${key}`);
  return key;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = DICTS[locale];
    const setLocale = (l: Locale) => {
      setLocaleState(l);
      try {
        window.localStorage.setItem("locale", l);
      } catch {
        /* ignore */
      }
    };
    const t = (key: TKey, vars?: Record<string, string | number>): string => {
      let out = getByPath(dict, key as string);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return out;
    };
    return { locale, setLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used inside <I18nProvider>");
  return ctx;
}
