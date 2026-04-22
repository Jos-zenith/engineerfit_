"use client"

import { getSupabaseClient } from "@/lib/supabase/client"

interface FetchWithAuthOptions extends RequestInit {
  accessToken?: string | null
}

export async function fetchWithAuth(input: RequestInfo | URL, init?: FetchWithAuthOptions) {
  const supabase = getSupabaseClient()
  let token = init?.accessToken ?? null

  if (!token) {
    const { data } = await supabase.auth.getSession()
    token = data.session?.access_token ?? null
  }

  const headers = new Headers(init?.headers ?? {})
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const { accessToken: _ignoredAccessToken, ...requestInit } = init ?? {}

  return fetch(input, {
    ...requestInit,
    headers,
  })
}
