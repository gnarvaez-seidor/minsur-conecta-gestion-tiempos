"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into `document.body` so any `position: fixed` inside anchors to the
 * VIEWPORT, never to a transformed ancestor.
 *
 * Why this exists: the app uses `transform` liberally (`animate-fade-in-up`, `animate-scale-in`,
 * etc.). A transformed element becomes the containing block for its `position: fixed`
 * descendants (CSS spec), so a non-portaled `fixed inset-0` overlay silently anchors to a
 * subtree and fails to cover the screen. Every full-viewport overlay (modal, dialog, drawer,
 * side panel, toast) MUST render through a portal — see CLAUDE.md ("Convenciones de diseño").
 *
 * The `mounted` guard keeps it static-export/hydration-safe: on the server (and the first client
 * render) it returns null, so `document` is never touched during SSG and there is no hydration
 * mismatch for overlays that stay mounted while closed.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
