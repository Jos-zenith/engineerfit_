import { createClient } from "@supabase/supabase-js"
import { assertSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env"

export function createSupabaseForAccessToken(accessToken: string) {
  assertSupabaseEnv()

  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

export function createSupabaseServerClient() {
  assertSupabaseEnv()
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}
