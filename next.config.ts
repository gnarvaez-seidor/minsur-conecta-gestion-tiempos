import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Pure static bundle (HTML/CSS/JS) for the SAP Workzone HTML5 App Repository — no Node server.
  output: "export",

  // Directory-style /route/index.html per route — the most host-agnostic layout for the
  // html5-apps-repo-rt file-existence resolution.
  trailingSlash: true,

  // The default <Image> optimizer needs a running server; unavailable in static export.
  images: { unoptimized: true },

  // Navigation is handled by the hash router (useHashRoute), not Next path links.
  skipTrailingSlashRedirect: true,

  // DO NOT set basePath or assetPrefix.
  // The Workzone html5 runtime serves under /<appHostId>~<svc>/<sapAppId>-<version>/,
  // unknown at build time and version-bearing. basePath/assetPrefix are inlined at build
  // and cannot adapt; a relative './' assetPrefix is unsupported and the App Router emits
  // root-anchored /_next/... URLs. We relativize the emitted HTML post-build
  // (scripts/relativize-export.mjs) and use HASH routing so deep links never hit the host.

  // Dev-only proxy (replaces the Vite server.proxy). The `rewrites` key is intentionally
  // ABSENT from the production export build (output:'export' would otherwise ignore/conflict).
  ...(isDev
    ? {
        async rewrites() {
          const gateway = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "";
          const seguridad =
            process.env.NEXT_PUBLIC_API_SEGURIDAD_URL ??
            process.env.NEXT_PUBLIC_API_GATEWAY_URL ??
            "";
          const rules: { source: string; destination: string }[] = [];
          if (gateway) rules.push({ source: "/dest-apigateway/:path*", destination: `${gateway}/:path*` });
          if (seguridad) rules.push({ source: "/dest-apiseguridad/:path*", destination: `${seguridad}/:path*` });
          return rules;
        },
      }
    : {}),
};

export default nextConfig;
