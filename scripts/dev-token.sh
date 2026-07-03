#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev-token.sh — DX local: obtiene/cachea un JWT de xsuaa-central y levanta el
# frontend apuntando al gateway conecta local (8082).
#
# En DESPLEGADO este script NO se usa: el token llega del approuter/portal
# Work Zone automáticamente (estrategias seidor/xsuaa).
#
# Fuentes de token (en orden):
#   1) --token <jwt>          argumento explícito
#   2) STOKEN=<jwt>           variable de entorno
#   3) cache ./.dev-token     si no expiró (claim exp del JWT)
#   4) npm run token:user:json en ../minsur-conecta-btp-cf-backend-nestjs-apigateway
#
# Uso:
#   ./scripts/dev-token.sh                 # obtiene token y levanta npm run dev -p 3001
#   ./scripts/dev-token.sh --token <jwt>
#   ./scripts/dev-token.sh --print         # solo imprime el token (no levanta)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GW_DIR="$DIR/../minsur-conecta-btp-cf-backend-nestjs-apigateway"
CACHE="$DIR/.dev-token"
TOKEN="${STOKEN:-}"; PRINT_ONLY=false

while [ $# -gt 0 ]; do case "$1" in
  --token) TOKEN="${2:-}"; shift 2;;
  --print) PRINT_ONLY=true; shift;;
  *) shift;;
esac; done

# ¿JWT vigente? — decodifica el payload y compara exp con now (+60s de margen)
jwt_valid() {
  local jwt="$1"
  local payload; payload=$(printf '%s' "$jwt" | cut -d. -f2 | tr '_-' '/+' )
  case $(( ${#payload} % 4 )) in 2) payload="${payload}==";; 3) payload="${payload}=";; esac
  local exp; exp=$(printf '%s' "$payload" | base64 -d 2>/dev/null | grep -o '"exp":[0-9]*' | grep -o '[0-9]*' || true)
  [ -n "$exp" ] && [ "$exp" -gt $(( $(date +%s) + 60 )) ]
}

# 3) cache
if [ -z "$TOKEN" ] && [ -f "$CACHE" ]; then
  CACHED=$(cat "$CACHE")
  if jwt_valid "$CACHED"; then TOKEN="$CACHED"; echo "✓ token de cache vigente (.dev-token)"; else echo "· cache expirado"; fi
fi

# 4) pedirlo al gateway (token:user:json → xsuaa-central, ROPC)
if [ -z "$TOKEN" ] && [ -d "$GW_DIR" ] && grep -q '"token:user:json"' "$GW_DIR/package.json" 2>/dev/null; then
  echo "· obteniendo token vía gateway (npm run token:user:json)…"
  RAW=$( (cd "$GW_DIR" && npm run -s token:user:json 2>/dev/null) || true )
  TOKEN=$(printf '%s' "$RAW" | grep -oE '"(access_token|sToken)"\s*:\s*"[^"]+"' | head -1 | sed -E 's/.*:\s*"([^"]+)"/\1/' || true)
  [ -z "$TOKEN" ] && TOKEN=$(printf '%s' "$RAW" | grep -oE 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' | head -1 || true)
fi

if [ -n "$TOKEN" ] && jwt_valid "$TOKEN"; then
  printf '%s' "$TOKEN" > "$CACHE"; chmod 600 "$CACHE"
  echo "✓ token vigente cacheado en .dev-token (gitignored)"
else
  echo "⚠ sin token válido — el front arrancará igual; pega el sToken en #/login,"
  echo "  o corre el gateway con --no-auth: ../dev-conecta.sh --no-auth"
fi

$PRINT_ONLY && { [ -n "$TOKEN" ] && echo "$TOKEN"; exit 0; }

echo "▶ levantando frontend :3001 → gateway :8082 (strategy=seidor, DEV_FORWARD_AUTH)"
cd "$DIR"
NEXT_PUBLIC_AUTH_STRATEGY=seidor \
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8082 \
NEXT_PUBLIC_API_SEGURIDAD_URL=http://localhost:8082 \
NEXT_PUBLIC_DEV_FORWARD_AUTH=true \
exec npm run dev -- -p 3001
