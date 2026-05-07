"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/Header";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Honeypot anti-bot polje — pravi korisnik ga ne vidi.
  const [companyWebsite, setCompanyWebsite] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
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

    if (password.length < 8) {
      setMessage("Lozinka mora imati najmanje 8 karaktera.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Nalog je kreiran. Ako je uključena email potvrda u Supabase-u, moraćeš potvrditi email."
      );
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
          onSubmit={handleRegister}
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
            Registracija
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Kreiraj nalog
          </h1>

          <div className="mt-7 grid gap-4">
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-rose-400"
            />

            <input
              type="password"
              autoComplete="new-password"
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
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Kreiranje..." : "Registruj se"}
            </button>
          </div>

          <p className="mt-6 text-sm font-bold text-slate-500">
            Već imaš nalog?{" "}
            <a href="/login" className="text-rose-600 hover:text-rose-700">
              Login
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}