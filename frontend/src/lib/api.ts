import { resolveMockApi } from '@/lib/mock-api'

const TOKEN_KEY = 'medishield_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  return resolveMockApi<T>(path, init, getToken())
}
