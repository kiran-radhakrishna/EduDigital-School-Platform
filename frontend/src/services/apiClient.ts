import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  withCredentials: true,
})

// Must match the backend's CSRF_COOKIE_NAME (backend/src/utils/jwt.ts) — it's deliberately
// non-httpOnly so this double-submit check can read it.
const CSRF_COOKIE_NAME = 'edudigital_csrf'
const CSRF_HEADER = 'x-csrf-token'
const SAFE_METHODS = new Set(['get', 'head', 'options'])

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

apiClient.interceptors.request.use((config) => {
  if (config.method && !SAFE_METHODS.has(config.method)) {
    const token = readCookie(CSRF_COOKIE_NAME)
    if (token) {
      config.headers.set(CSRF_HEADER, token)
    }
  }
  return config
})

// Access tokens are short-lived (see backend ACCESS_TOKEN_TTL_SECONDS); on a 401 we attempt one
// silent refresh via the httpOnly refresh cookie and retry the original request before giving up.
let refreshInFlight: Promise<boolean> | null = null

async function attemptRefresh(): Promise<boolean> {
  refreshInFlight ??= apiClient
    .post('/auth/refresh')
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const isAuthEndpoint = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true
      const refreshed = await attemptRefresh()
      if (refreshed) {
        return apiClient(config)
      }
    }

    return Promise.reject(error)
  },
)
