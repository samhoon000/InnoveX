import { resolveMockApi } from './mock-api'

const TOKEN_KEY = 'medishield_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
  } else {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers || {})

  const token = getToken()

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    )
  }

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    )
  }

  try {
    const response = await fetch(
      `http://localhost:5000${path}`,
      {
        ...init,
        headers,
      }
    )

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`

      try {
        const errorData =
          await response.json()

        errorMessage =
          errorData.error ||
          errorData.message ||
          errorMessage
      } catch {
        //
      }

      throw new Error(errorMessage)
    }

    return response.json()
  } catch (err) {
    console.warn(
      'Backend unavailable, using mock API:',
      err
    )

    await new Promise((resolve) =>
      setTimeout(resolve, 400)
    )

    return resolveMockApi<T>(
      path,
      init,
      token
    )
  }
}