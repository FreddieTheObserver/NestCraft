type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
  }
  message?: string
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

function normalizeApiPath(path: string) {
  if (!path.startsWith('/')) {
    return `/api/${path}`
  }

  return path.startsWith('/api') ? path : `/api${path}`
}

export function buildApiUrl(path: string) {
  const normalizedPath = normalizeApiPath(path)

  if (!configuredApiBaseUrl) {
    return normalizedPath
  }

  if (/^https?:\/\//i.test(configuredApiBaseUrl)) {
    const baseUrl = configuredApiBaseUrl.endsWith('/')
      ? configuredApiBaseUrl
      : `${configuredApiBaseUrl}/`

    return new URL(normalizedPath.replace(/^\//, ''), baseUrl).toString()
  }

  const trimmedBaseUrl = configuredApiBaseUrl.endsWith('/')
    ? configuredApiBaseUrl.slice(0, -1)
    : configuredApiBaseUrl

  return `${trimmedBaseUrl}${normalizedPath}`
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(buildApiUrl(path), init)
}

export async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ApiErrorPayload
    return data.error?.message ?? data.message ?? fallback
  } catch {
    return fallback
  }
}
