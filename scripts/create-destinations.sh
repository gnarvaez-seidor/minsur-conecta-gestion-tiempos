#!/usr/bin/env bash
# Crea/actualiza los destinos subaccount dest-apigateway y dest-apiseguridad
# (destinos planos hacia el API Gateway con token forwarding) vía la API del
# destination service. Requiere sesión cf activa y el service-key 'dest-admin-key'
# sobre la instancia de destination del subaccount (por defecto la de esta app).
# NOTA: ajusta DEST_INSTANCE/KEY al nombre real de tu service instance si difiere.
#
# Uso: ./scripts/create-destinations.sh [GATEWAY_URL]
set -euo pipefail

GATEWAY_URL="${1:-https://minsur-conecta-apigateway-backend-dev.cfapps.us10-001.hana.ondemand.com}"
DEST_INSTANCE="${DEST_INSTANCE:-minsur-conecta-gestion-tiempos-dest}"
KEY="${DEST_KEY:-dest-admin-key}"

command -v cf >/dev/null || { echo "cf CLI requerido"; exit 1; }
cf service-key "$DEST_INSTANCE" "$KEY" >/dev/null 2>&1 || cf create-service-key "$DEST_INSTANCE" "$KEY" >/dev/null

CREDS_JSON=$(cf service-key "$DEST_INSTANCE" "$KEY" | tail -n +2)

GATEWAY_URL="$GATEWAY_URL" DEST_INSTANCE="$DEST_INSTANCE" DEST_KEY="$KEY" node <<'NODE'
const raw = require('child_process').execSync(`cf service-key ${process.env.DEST_INSTANCE} ${process.env.DEST_KEY}`, {encoding:'utf8'});
const json = JSON.parse(raw.slice(raw.indexOf('{')));
const c = json.credentials || json;
const tokenUrl = `${c.url.replace(/\/$/,'')}/oauth/token`;
const apiBase = `${c.uri.replace(/\/$/,'')}/destination-configuration/v1/subaccountDestinations`;
const GW = process.env.GATEWAY_URL;

const destinations = [
  { Name: 'dest-apigateway', Type: 'HTTP', URL: GW, Authentication: 'NoAuthentication', ProxyType: 'Internet', 'HTML5.ForwardAuthToken': 'true', 'HTML5.Timeout': '600000' },
  { Name: 'dest-apiseguridad', Type: 'HTTP', URL: GW, Authentication: 'NoAuthentication', ProxyType: 'Internet', 'HTML5.ForwardAuthToken': 'true' },
];

async function main() {
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: c.clientid, client_secret: c.clientsecret });
  const tr = await fetch(tokenUrl, { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body });
  if (!tr.ok) throw new Error(`token ${tr.status}: ${await tr.text()}`);
  const token = (await tr.json()).access_token;
  const auth = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  for (const d of destinations) {
    // POST crea; si existe (409) => PUT actualiza.
    let r = await fetch(apiBase, { method: 'POST', headers: auth, body: JSON.stringify(d) });
    if (r.status === 409) {
      r = await fetch(apiBase, { method: 'PUT', headers: auth, body: JSON.stringify(d) });
      console.log(`~ ${d.Name}: actualizado (${r.status})`);
    } else {
      console.log(`+ ${d.Name}: creado (${r.status})`);
    }
    if (!r.ok && r.status !== 409) console.log(`  WARN ${d.Name}: ${await r.text()}`);
  }
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
NODE
