import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl.startsWith("http")) ? rawUrl : "https://placeholder-url.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

const supabase = createClient(supabaseUrl, anonKey);

// Next.js config to ensure this route is not statically cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // If we're using placeholder credentials, just return ok
    if (supabaseUrl.includes("placeholder-url")) {
      return NextResponse.json({ 
        status: "ok", 
        message: "Placeholder config active, no db ping." 
      }, { status: 200 });
    }

    // A lightweight query to keep the Supabase PostgreSQL database active.
    // Fetching 1 row from a small table (store_settings) is very cheap.
    const { data, error } = await supabase
      .from("store_settings")
      .select("id")
      .limit(1)
      .single();

    if (error) {
      console.error("Keep-alive ping failed:", error);
      return NextResponse.json({ 
        status: "error", 
        message: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "Supabase connection active"
    }, { status: 200 });
  } catch (err: any) {
    console.error("Keep-alive error:", err);
    return NextResponse.json({ 
      status: "error", 
      message: err.message || "Unknown error" 
    }, { status: 500 });
  }
}
