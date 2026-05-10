const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export function getApiBaseUrl(): string {
  return API_BASE.replace(/\/$/, '')
}

/** Central fetch wrapper — add auth headers / tracing here later. */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getApiBaseUrl()
  const url = input.startsWith('http') ? input : `${base}${input}`
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}
