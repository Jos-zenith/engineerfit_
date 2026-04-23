"use client"

import { createBrowserClient } from "@supabase/ssr"
import { assertSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env"

let singletonClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
	if (!singletonClient) {
		assertSupabaseEnv()
		singletonClient = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
	}

	return singletonClient
}
