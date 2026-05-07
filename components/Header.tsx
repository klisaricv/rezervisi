"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const navTabs = [
  { label: "HOME", href: "/" },
  { label: "PROSTORI", href: "/prostori" },
  { label: "MUZIKA", href: "/muzika" },
  { label: "DEKORACIJE", href: "/dekoracije" },
  { label: "EFEKTI & RASVETA", href: "/efekti-rasveta" },
  { label: "FOTO & VIDEO", href: "/foto-video" },
  { label: "ULEPŠAVANJE", href: "/ulepsavanje" },
  { label: "OSTALE USLUGE", href: "/ostale-usluge" },
];

export default function Header({
  showAddButton = true,
}: {
  showAddButton?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadAuthState() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || null;
    const email = data.session?.user?.email || null;

    setUserEmail(email);

    if (!token) {
      setIsAdmin(false);
      setAuthChecked(true);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      setIsAdmin(Boolean(result.isAdmin));
    } catch {
      setIsAdmin(false);
    } finally {
      setAuthChecked(true);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  useEffect(() => {
    loadAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAuthState();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4">
          <a
            href="/"
            className="shrink-0 text-2xl font-black tracking-tight text-slate-950"
          >
            Rezervisi<span className="text-rose-600">.to</span>
          </a>

          <div className="flex items-center gap-2">
            {authChecked && !userEmail && (
              <>
                <a
                  href="/login"
                  className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:inline-flex"
                >
                  Login
                </a>

                <a
                  href="/register"
                  className="hidden rounded-full bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 sm:inline-flex"
                >
                  Register
                </a>
              </>
            )}

            {authChecked && userEmail && (
              <>
                {isAdmin && (
                  <a
                    href="/admin"
                    className="hidden rounded-full bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 sm:inline-flex"
                  >
                    Admin
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:inline-flex"
                >
                  Logout
                </button>
              </>
            )}

            {showAddButton && (
              <a
                href="/dodaj-uslugu"
                className="hidden rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-rose-600 md:inline-flex"
              >
                Dodaj uslugu
              </a>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-900 xl:hidden"
              aria-label="Otvori meni"
            >
              ☰
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-slate-100 xl:block">
          <div className="mx-auto flex max-w-[1320px] items-center justify-center gap-2 px-4 py-3">
            {navTabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="rounded-full px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-rose-600"
              >
                {tab.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-label="Zatvori meni"
          />

          <div className="absolute right-0 top-0 h-full w-[310px] bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-black text-slate-950"
              >
                Rezervisi<span className="text-rose-600">.to</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-700"
                aria-label="Zatvori meni"
              >
                ×
              </button>
            </div>

            <div className="grid gap-2">
              {navTabs.map((tab) => (
                <a
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-black uppercase tracking-wide text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  {tab.label}
                </a>
              ))}

              <div className="my-3 h-px bg-slate-100" />

              {authChecked && !userEmail && (
                <>
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-wide text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    Login
                  </a>

                  <a
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl bg-rose-600 px-4 py-4 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-rose-700"
                  >
                    Register
                  </a>
                </>
              )}

              {authChecked && userEmail && (
                <>
                  {isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-2xl bg-rose-600 px-4 py-4 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-rose-700"
                    >
                      Admin
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-wide text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    Logout
                  </button>
                </>
              )}

              {showAddButton && (
                <a
                  href="/dodaj-uslugu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-slate-950 px-4 py-4 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-rose-600"
                >
                  Dodaj uslugu
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}