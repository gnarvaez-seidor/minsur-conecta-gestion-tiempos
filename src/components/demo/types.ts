/** Respuesta del servicio dummy /rest/demo/whoami (apiintegracion-compuesto). */
export interface DemoResponse {
  origen: string;
  mensaje: string;
  recibidoEn: string;
  instancia: string;
  gateway: {
    idtransaccion?: string;
    aplicacion?: string;
  };
  usuario: {
    email?: string;
    given_name?: string;
    family_name?: string;
    user_name?: string;
  };
  token: {
    preview: string | null;
    exp?: number;
    iss?: string;
    azp?: string;
    raw?: string;
  };
}
