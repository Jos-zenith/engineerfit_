"use client"

import { createClient } from "@supabase/supabase-js"
import { assertSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env"

let singletonClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
	if (!singletonClient) {
		assertSupabaseEnv()
		singletonClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
	}

	return singletonClient
}
