"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/Header";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Nalog je kreiran. Ako je uključena email potvrda u Supabase-u, moraćeš potvrditi email."
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="mx-auto max-w-md px-4 py-14">
        <form
          onSubmit={handleRegister}
          className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-600">
            Registracija
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Kreiraj nalog
          </h1>

          <div className="mt-7 grid gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-rose-400"
            />

            <input
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-rose-400"
            />

            {message && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                {message}
              </div>
            )}

            <button
              disabled={loading}
              className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-rose-600 disabled:opacity-60"
            >
              {loading ? "Kreiranje..." : "Registruj se"}
            </button>
          </div>

          <p className="mt-6 text-sm font-bold text-slate-500">
            Već imaš nalog?{" "}
            <a href="/login" className="text-rose-600">
              Login
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}