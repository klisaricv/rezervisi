"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/Header";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Ako email servis bude podešen u Supabase-u, korisnik će dobiti link za reset lozinke. Za sada ovo zavisi od Supabase email podešavanja."
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="mx-auto max-w-md px-4 py-14">
        <form
          onSubmit={handleReset}
          className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-600">
            Reset lozinke
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Zaboravljena lozinka
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Unesi email. Kasnije ćemo povezati pravi email sender ako bude potrebno.
          </p>

          <div className="mt-7 grid gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Slanje..." : "Pošalji reset link"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}