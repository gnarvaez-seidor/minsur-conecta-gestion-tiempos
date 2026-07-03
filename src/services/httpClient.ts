import axios, { type InternalAxiosRequestConfig } from "axios";

/**
 * "Dumb" HTTP client. It knows NOTHING about sToken/XSUAA/headers — all of that lives in
 * the active AuthStrategy (src/auth/), which is wired in via setRequestDecorator/
 * setUnauthorizedHandler at app start (installAuthStrategy in src/auth/index.ts).
 *
 * baseURL is "" (relative) so requests resolve against document.baseURI under the versioned
 * Workzone base path — the same reason the Vite app used base:'./'.
 */
type RequestDecorator = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

let requestDecorator: RequestDecorator = (config) => config;
let unauthorizedHandler: () => void = () => {};

export function setRequestDecorator(fn: RequestDecorator): void {
  requestDecorator = fn;
}
export function setUnauthorizedHandler(fn: () => void): void {
  unauthorizedHandler = fn;
}

export const httpClient = axios.create({
  baseURL: "",
  timeout: 30000,
  withCredentials: true, // forward the XSUAA session cookie in Workzone
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => requestDecorator(config));

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = (error?.config?.url || "").toLowerCase();
    // Don't bounce to login if the 401 came from /useridp itself (that endpoint decides auth).
    if (error?.response?.status === 401 && !url.includes("useridp")) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  },
);
