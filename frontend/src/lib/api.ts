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
    headers.set('Authorization', `Bearer ${token}`)
  }

  // safer JSON handling
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(
    `http://localhost:5000${path}`,
    {
      ...init,
      headers,
    }
  )

  // safer error parsing
  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`

    try {
      const errorData = await response.json()

      errorMessage =
        errorData.error ||
        errorData.message ||
        errorMessage
    } catch {
      // ignore json parse failure
    }

    throw new Error(errorMessage)
  }

  return response.json()
}