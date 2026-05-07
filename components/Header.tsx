"use client";

import { useState } from "react";

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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-4">
          <a
            href="/"
            className="text-2xl font-black tracking-tight text-slate-950"
          >
            Rezervisi<span className="text-rose-600">.to</span>
          </a>

          <div className="flex items-center gap-3">
            {showAddButton && (
              <a
                href="/dodaj-uslugu"
                className="hidden rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-rose-600 sm:inline-flex"
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

          <div className="absolute right-0 top-0 h-full w-[290px] bg-white p-5 shadow-2xl">
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

              {showAddButton && (
                <a
                  href="/dodaj-uslugu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-3 rounded-2xl bg-slate-950 px-4 py-4 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-rose-600"
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