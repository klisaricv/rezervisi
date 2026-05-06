"use client";

import { useEffect, useMemo, useState } from "react";
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

const locationData: Record<string, Record<string, string[]>> = {
  "Bosna i Hercegovina": {
    "Republika Srpska": ["Bijeljina", "Banja Luka", "Doboj", "Trebinje"],
    "Federacija BiH": ["Sarajevo", "Tuzla", "Mostar", "Zenica"],
  },
  Srbija: {
    Beograd: ["Beograd", "Zemun", "Novi Beograd"],
    Vojvodina: ["Novi Sad", "Subotica", "Zrenjanin", "Sombor"],
    "Centralna Srbija": ["Kragujevac", "Niš", "Čačak", "Kraljevo"],
  },
  "Inostranstvo/Dijaspora": {
    Evropa: ["Beč", "Minhen", "Cirih", "Ljubljana"],
    Amerika: ["Chicago", "New York", "Toronto"],
  },
};

type Service = {
  id: string;
  title: string;
  category: string;
  description: string;
  country: string;
  region: string | null;
  city: string;
  coverage_area: string | null;
  price_type: string;
  price_from: number | null;
  currency: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  contact_instagram?: string | null;
  contact_facebook?: string | null;
  contact_website?: string | null;
};

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-900 xl:hidden"
          >
            ☰
          </button>

          <a href="/" className="shrink-0 text-2xl font-black tracking-tight">
            Rezervisi<span className="text-rose-600">.to</span>
          </a>

          <a
            href="/dodaj-uslugu"
            className="shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600"
          >
            Dodaj uslugu
          </a>
        </div>

        <div className="hidden border-t border-slate-100 px-4 pb-3 xl:block">
          <nav className="no-scrollbar mx-auto flex max-w-7xl items-center justify-center gap-2 overflow-x-auto rounded-full bg-slate-100 p-1">
            {navTabs.map((tab) => (
              <a
                key={tab.label}
                href={tab.href}
                className="shrink-0 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wide text-slate-600 transition hover:bg-white hover:text-rose-600 hover:shadow-sm"
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <a href="/" className="text-2xl font-black tracking-tight">
                Rezervisi<span className="text-rose-600">.to</span>
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-700"
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col gap-2 p-5">
              {navTabs.map((tab) => (
                <a
                  key={tab.label}
                  href={tab.href}
                  className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-black uppercase tracking-wide text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  {tab.label}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function FilterSelect({
  label,
  placeholder,
  options,
  selected,
  setSelected,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  setSelected: (values: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function toggle(value: string) {
    setSelected(
      selected.includes(value)
        ? selected.filter((x) => x !== value)
        : [...selected, value]
    );
  }

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex h-12 w-full items-center justify-between border-r border-slate-100 px-4 text-left disabled:opacity-40"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="truncate text-sm font-black text-slate-950">
            {selected.length ? `${selected.length} izabrano` : placeholder}
          </p>
        </div>

        <span className="ml-2 text-slate-400">⌄</span>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-14 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="max-h-56 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-slate-50"
              >
                <span>{option}</span>
                {selected.includes(option) && (
                  <span className="text-rose-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBar() {
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const regionOptions = useMemo(() => {
    return countries.flatMap((country) =>
      Object.keys(locationData[country] || {})
    );
  }, [countries]);

  const cityOptions = useMemo(() => {
    if (!countries.length) return [];

    const result: string[] = [];

    countries.forEach((country) => {
      const countryRegions = locationData[country] || {};
      const activeRegions = regions.length
        ? regions
        : Object.keys(countryRegions);

      activeRegions.forEach((region) => {
        result.push(...(countryRegions[region] || []));
      });
    });

    return Array.from(new Set(result));
  }, [countries, regions]);

  return (
    <div className="sticky top-[84px] z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl xl:top-[125px]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm md:flex-row md:items-center">
          <FilterSelect
            label="Država"
            placeholder="Sve države"
            options={Object.keys(locationData)}
            selected={countries}
            setSelected={(values) => {
              setCountries(values);
              setRegions([]);
              setCities([]);
            }}
          />

          <FilterSelect
            label="Regija"
            placeholder="Sve regije"
            options={regionOptions}
            selected={regions}
            disabled={!countries.length}
            setSelected={(values) => {
              setRegions(values);
              setCities([]);
            }}
          />

          <FilterSelect
            label="Grad"
            placeholder="Svi gradovi"
            options={cityOptions}
            selected={cities}
            disabled={!countries.length}
            setSelected={setCities}
          />

          <div className="p-2 md:w-[160px]">
            <button className="h-12 w-full rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
              Filtriraj
            </button>
          </div>
        </div>

        {(countries.length > 0 || regions.length > 0 || cities.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {[...countries, ...regions, ...cities].map((item) => (
              <span
                key={item}
                className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getContact(service: Service) {
  if (service.contact_phone) return service.contact_phone;
  if (service.contact_email) return service.contact_email;
  if (service.contact_instagram) return service.contact_instagram;
  if (service.contact_facebook) return service.contact_facebook;
  if (service.contact_website) return service.contact_website;
  return "Kontakt nije unet";
}

function priceLabel(service: Service) {
  if (service.price_type === "agreement" || !service.price_from) {
    return "Po dogovoru";
  }

  return `od ${service.price_from} ${service.currency}`;
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative h-48 bg-gradient-to-br from-rose-400 to-orange-700">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.05),rgba(0,0,0,.38))]" />

        <div className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide text-white backdrop-blur">
          Preporučujemo
        </div>

        <button className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-lg shadow-lg">
          ♡
        </button>

        <div className="absolute bottom-5 left-5 text-6xl drop-shadow-xl">
          🏛️
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">
            {service.category}
          </span>
          <span className="text-xs font-bold text-slate-400">Verifikovano</span>
        </div>

        <h3 className="text-lg font-black text-slate-950">{service.title}</h3>

        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">
          {service.description || "Opis nije dodat."}
        </p>

        <div className="mt-4 text-sm font-bold text-slate-500">
          📍 {service.city || service.coverage_area || service.country}
        </div>

        <div className="mt-3 text-sm font-bold text-slate-700">
          ☎ {getContact(service)}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-black uppercase text-slate-400">Cena</p>
            <p className="text-xl font-black text-slate-950">
              {priceLabel(service)}
            </p>
          </div>

          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600">
            Detalji
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CategoryPage({
  title,
  category,
  subtitle,
}: {
  title: string;
  category: string;
  subtitle: string;
}) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("category", category)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      setServices((data || []) as Service[]);
    }

    loadServices();
  }, [category]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-5 pt-9">
          <div className="max-w-3xl">
            <p className="w-fit rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-rose-600">
              Rezervisi.to
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      <FilterBar />

      <section className="mx-auto max-w-7xl px-4 py-8">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-500">
            Još nema odobrenih usluga u ovoj kategoriji.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}