"use client"

interface FetchWithAuthOptions extends RequestInit {
  accessToken?: string | null
}

/**
 * Wrapper around fetch that automatically includes auth token if available.
 * Token is read from browser cookies set by NextAuth.
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: FetchWithAuthOptions) {
  const headers = new Headers(init?.headers ?? {})
  
  // NextAuth stores session in cookies, so no need to manually add token
  // The browser will automatically send cookies with fetch

  const { accessToken: _ignoredAccessToken, ...requestInit } = init ?? {}

  return fetch(input, {
    ...requestInit,
    headers,
    credentials: 'include', // Send cookies with request
  })
}
