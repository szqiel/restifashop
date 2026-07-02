"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || "Email atau password salah.");
      }

      // Refresh page and redirect to dashboard
      router.refresh();
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center py-20 px-margin-mobile md:px-margin-desktop bg-surface-dim min-h-dvh">
      <div className="w-full max-w-md bg-white border border-border-custom/50 rounded-md p-8 shadow-lg animate-scale-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent font-sans text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Toko
          </Link>
          <span className="block font-sans font-bold text-[10px] text-accent uppercase tracking-widest mb-2">
            Portal Penjual
          </span>
          <h1 className="font-serif text-display-sm text-text-primary">
            Masuk Admin
          </h1>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-error/10 p-4 text-xs font-semibold text-error mb-6">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          {/* Email */}
          <div>
            <label className="block font-sans font-bold text-[10px] text-text-primary uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border-b border-border-custom bg-transparent pl-8 pr-2 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
              />
              <Mail className="absolute left-1 top-3.5 h-4 w-4 text-text-muted" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-sans font-bold text-[10px] text-text-primary uppercase tracking-widest mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b border-border-custom bg-transparent pl-8 pr-2 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors"
              />
              <Lock className="absolute left-1 top-3.5 h-4 w-4 text-text-muted" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-white font-sans font-bold text-label rounded-md tracking-widest uppercase transition-all duration-fast hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 btn-tactile mt-2"
          >
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>
      </div>
    </main>
  );
}
