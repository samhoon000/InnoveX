import { resolveMockApi } from './mock-api'

const TOKEN_KEY = 'medishield_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {})
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (path.startsWith('/api/auth')) {
    const response = await fetch(`http://localhost:5000${path}`, {
      ...init,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`)
    }

    return response.json()
  }

  // Fallback to mock API for everything else
  await new Promise((resolve) => setTimeout(resolve, 400))
  return resolveMockApi<T>(path, init, token)
}
