import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

function createDevFetch(baseFetch: typeof fetch): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers);
    if (import.meta.env.DEV && init?.method && init.method !== "GET") {
      console.log("[Supabase fetch]", init.method, input);
      console.log("[Supabase fetch] Authorization present:", headers.has("Authorization"));
      console.log("[Supabase fetch] apikey present:", headers.has("apikey"));
    }
    return baseFetch(input, init);
  };
}

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      ...(!supabaseUrl ? ["VITE_SUPABASE_URL"] : []),
      ...(!supabaseAnonKey ? ["VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}`);
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        apikey: supabaseAnonKey,
      },
      fetch: typeof window !== "undefined" ? createDevFetch(window.fetch.bind(window)) : undefined,
    },
  });

  if (import.meta.env.DEV) {
    console.log("Supabase client initialized with URL:", supabaseUrl);
  }

  return client;
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
