import { en } from "./en";

/** The dictionary shape — derived from the English source of truth. */
export type Dictionary = typeof en;

export type Locale = "en" | "es";

/**
 * Recursive dot-paths to the STRING leaves of the dictionary, e.g. "records.table.code".
 * Gives `t()` autocomplete + compile-time safety against typos.
 */
export type DotPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
    }[keyof T & string];

export type TKey = DotPaths<Dictionary>;
