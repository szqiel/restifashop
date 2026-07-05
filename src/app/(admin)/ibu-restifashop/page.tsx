"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, AlertCircle, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up admin account
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "admin",
            }
          }
        });

        if (authError) {
          throw new Error(authError.message || "Gagal mendaftarkan akun.");
        }

        setSuccess("Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk konfirmasi (jika email konfirmasi aktif), lalu silakan Masuk.");
        setIsSignUp(false);
        setPassword("");
      } else {
        // Sign In admin account
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
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center py-20 px-margin-mobile md:px-margin-desktop bg-surface-dim min-h-dvh">
      <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl p-8 shadow-lg animate-scale-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-sans text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Toko
          </Link>
          <span className="block font-sans font-bold text-[10px] text-primary uppercase tracking-widest mb-2">
            Portal Penjual
          </span>
          <h1 className="font-serif text-display-sm text-on-surface">
            {isSignUp ? "Daftar Admin" : "Masuk Admin"}
          </h1>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-error/10 p-4 text-xs font-semibold text-error mb-6">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-4 text-xs font-semibold text-green-600 mb-6">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div className="text-left">
            <label className="block font-sans font-bold text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
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
                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-sans text-sm text-on-surface placeholder:text-text-muted focus:border-primary focus:outline-none transition-all shadow-2xs"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-on-surface-variant" />
            </div>
          </div>

          {/* Password */}
          <div className="text-left">
            <label className="block font-sans font-bold text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
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
                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-sans text-sm text-on-surface placeholder:text-text-muted focus:border-primary focus:outline-none transition-all shadow-2xs"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-on-surface-variant" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-on-surface text-surface font-label-caps text-label-caps rounded-full uppercase tracking-widest hover:bg-surface-tint transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 btn-tactile mt-2 cursor-pointer"
          >
            {loading ? "Memproses..." : isSignUp ? "Daftar Akun" : "Masuk Sekarang"}
          </button>
        </form>

        {/* Switch Mode Toggle */}
        <div className="mt-6 text-center border-t border-outline-variant/20 pt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccess("");
            }}
            className="text-xs font-sans font-semibold text-primary hover:underline cursor-pointer"
          >
            {isSignUp ? "Sudah punya akun? Masuk di sini" : "Belum punya akun? Daftar sebagai admin baru"}
          </button>
        </div>
      </div>
    </main>
  );
}
