import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !rawUrl || !rawUrl.startsWith("http");
  
  if (isPlaceholder && typeof window !== "undefined") {
    console.warn(
      "Supabase Client initialized with PLACEHOLDER credentials. " +
      "Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Project Environment Variables settings."
    );
  }

  const supabaseUrl = !isPlaceholder ? rawUrl : "https://placeholder-url.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
