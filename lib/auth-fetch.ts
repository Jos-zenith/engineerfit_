"use client"

interface FetchWithAuthOptions extends RequestInit {
  accessToken?: string | null
}

function getStoredRole() {
  if (typeof window === "undefined") {
    return null
  }

  const role = window.localStorage.getItem("engineerfit-role")
  return role === "student" || role === "recruiter" ? role : null
}

/**
 * Wrapper around fetch that automatically includes the chosen role for guest access.
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: FetchWithAuthOptions) {
  const headers = new Headers(init?.headers ?? {})
  const role = getStoredRole()

  if (role) {
    headers.set("x-user-role", role)
  }

  const { accessToken: _ignoredAccessToken, ...requestInit } = init ?? {}

  return fetch(input, {
    ...requestInit,
    headers,
    credentials: "include",
  })
}
