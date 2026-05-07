"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/Header";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Honeypot anti-bot polje — pravi korisnik ga ne vidi.
  const [companyWebsite, setCompanyWebsite] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // Ako je ovo popunjeno, skoro sigurno je bot.
    if (companyWebsite.trim()) {
      setMessage("Zahtev nije validan.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setMessage("Unesi email i lozinku.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (token) {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.isAdmin) {
          window.location.href = "/admin";
          return;
        }
      }

      window.location.href = "/";
    } catch {
      setMessage("Došlo je do greške. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="mx-auto max-w-md px-4 py-14">
        <form
          onSubmit={handleLogin}
          className="relative rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
        >
          {/* Honeypot field — sakriveno za ljude, vidljivo botovima koji čitaju HTML */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
          >
            <label>
              Company website
              <input
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </label>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-600">
            Prijava
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">Login</h1>

          <div className="mt-7 grid gap-4">
            <input
              type="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-rose-400"
            />

            <input
              type="password"
              autoComplete="current-password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-rose-400"
            />

            {message && (
              <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Prijava..." : "Prijavi se"}
            </button>
          </div>

          <div className="mt-6 flex justify-between text-sm font-bold">
            <a href="/register" className="text-slate-600 hover:text-rose-600">
              Registracija
            </a>

            <a
              href="/forgot-password"
              className="text-slate-600 hover:text-rose-600"
            >
              Zaboravljena lozinka?
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}