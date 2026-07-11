/**
 * Frontend public env (Vite).
 * Only variables prefixed with VITE_ are available here.
 */
export const APP_NAME =
  (import.meta.env.VITE_APP_NAME as string | undefined)?.trim() || 'git-contact'

/** Axios / fetch base path — usually `/api` (proxied to the backend in dev). */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api'
