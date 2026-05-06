"use client";

import { useMemo, useState } from "react";

const navTabs = [
  "HOME",
  "PROSTORI",
  "MUZIKA",
  "DEKORACIJE",
  "EFEKTI & RASVETA",
  "FOTO & VIDEO",
  "ULEPŠAVANJE",
  "OSTALE USLUGE",
];

const categoryOptions = [
  "Prostori",
  "Muzika",
  "Dekoracije",
  "Efekti & Rasveta",
  "Foto & Video",
  "Ulepšavanje",
  "Ostale usluge",
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

const items = [
  {
    title: "Villa Prestige",
    description: "Luksuzna sala za svadbe i proslave, kapacitet do 300 gostiju.",
    location: "Bijeljina",
    price: "od 1.200€",
    category: "Prostori",
    badge: "Top izbor",
    emoji: "🏛️",
    gradient: ["#fb7185", "#f97316"],
  },
  {
    title: "Grand Event Hall",
    description: "Moderan prostor za venčanja, rođendane i korporativne evente.",
    location: "Beograd",
    price: "od 1.800€",
    category: "Prostori",
    badge: "Premium",
    emoji: "🥂",
    gradient: ["#8b5cf6", "#ec4899"],
  },
  {
    title: "Royal Bend",
    description: "Bend od 6 članova za svadbe, klubove i privatne proslave.",
    location: "Cela Srbija",
    price: "od 900€",
    category: "Muzika",
    badge: "Popularno",
    emoji: "🎤",
    gradient: ["#0ea5e9", "#6366f1"],
  },
  {
    title: "DJ Marko Live",
    description: "DJ, sax live performance i kompletna ozvučenja za evente.",
    location: "Novi Sad",
    price: "od 350€",
    category: "Muzika",
    badge: "Novo",
    emoji: "🎧",
    gradient: ["#06b6d4", "#14b8a6"],
  },
  {
    title: "Bloom Dekor",
    description: "Cvetni aranžmani, mladenački sto i kompletna dekoracija sale.",
    location: "Novi Sad",
    price: "od 500€",
    category: "Dekoracije",
    badge: "Elegantno",
    emoji: "🌸",
    gradient: ["#f43f5e", "#d946ef"],
  },
  {
    title: "Luxury Floral Studio",
    description: "Premium dekoracija za svadbe, rođendane i gala večeri.",
    location: "Sarajevo",
    price: "Po dogovoru",
    category: "Dekoracije",
    badge: "Premium",
    emoji: "💐",
    gradient: ["#ec4899", "#f59e0b"],
  },
  {
    title: "LightPro FX",
    description: "Rasveta, dim, konfete, led ekrani i scenski efekti.",
    location: "Banja Luka",
    price: "od 450€",
    category: "Efekti & Rasveta",
    badge: "Show",
    emoji: "💡",
    gradient: ["#facc15", "#f97316"],
  },
  {
    title: "Club Visuals",
    description: "Efekti za klubove, bine, koncertne događaje i velike sale.",
    location: "Beograd",
    price: "od 650€",
    category: "Efekti & Rasveta",
    badge: "Pro",
    emoji: "🎆",
    gradient: ["#22c55e", "#0ea5e9"],
  },
  {
    title: "Studio Moment",
    description: "Foto i video snimanje, dron, highlight film i kompletna obrada.",
    location: "Beograd",
    price: "od 750€",
    category: "Foto & Video",
    badge: "4K",
    emoji: "📸",
    gradient: ["#334155", "#64748b"],
  },
  {
    title: "FrameHouse Weddings",
    description: "Filmski wedding video, fotografisanje i albumi premium kvaliteta.",
    location: "Tuzla",
    price: "od 1.000€",
    category: "Foto & Video",
    badge: "Cinema",
    emoji: "🎬",
    gradient: ["#7c3aed", "#2563eb"],
  },
  {
    title: "Glam Studio Ana",
    description: "Profesionalno šminkanje i frizura za mlade i goste.",
    location: "Bijeljina",
    price: "od 80€",
    category: "Ulepšavanje",
    badge: "Beauty",
    emoji: "💄",
    gradient: ["#fb7185", "#ec4899"],
  },
  {
    title: "Beauty Team Elite",
    description: "Mobilni beauty tim za venčanja, rođendane i svečane evente.",
    location: "Novi Sad",
    price: "od 150€",
    category: "Ulepšavanje",
    badge: "Mobile",
    emoji: "✨",
    gradient: ["#a855f7", "#f43f5e"],
  },
];

const sections = [
  { title: "Istaknuti prostori", category: "Prostori" },
  { title: "Istaknuta muzika", category: "Muzika" },
  { title: "Istaknute dekoracije", category: "Dekoracije" },
  { title: "Efekti i rasveta", category: "Efekti & Rasveta" },
  { title: "Foto & video", category: "Foto & Video" },
  { title: "Ulepšavanje i ostale usluge", category: "Ulepšavanje" },
];

function toggleItem(value: string, list: string[], setter: (v: string[]) => void) {
  setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
}

function CompactSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="group flex min-w-0 flex-1 flex-col gap-1 border-b border-slate-100 px-3 py-2 md:border-b-0 md:border-r">
      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <select
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none disabled:text-slate-300"
      >
        <option value="">Sve</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SearchBar() {
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const regions = useMemo(
    () => (country ? Object.keys(locationData[country] || {}) : []),
    [country]
  );

  const cities = useMemo(() => {
    if (!country) return [];
    const data = locationData[country] || {};
    if (region) return data[region] || [];
    return Object.values(data).flat();
  }, [country, region]);

  const bar = (
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-premium md:grid-cols-[1.1fr_1fr_1fr_1fr_auto]">
      <CompactSelect
        label="Kategorija"
        value={category}
        options={categoryOptions}
        onChange={setCategory}
      />
      <CompactSelect
        label="Država"
        value={country}
        options={Object.keys(locationData)}
        onChange={(v) => {
          setCountry(v);
          setRegion("");
          setCity("");
        }}
      />
      <CompactSelect
        label="Regija"
        value={region}
        options={regions}
        disabled={!country}
        onChange={(v) => {
          setRegion(v);
          setCity("");
        }}
      />
      <CompactSelect
        label="Grad"
        value={city}
        options={cities}
        disabled={!country}
        onChange={setCity}
      />
      <button className="m-2 rounded-2xl bg-rose-600 px-7 py-4 text-sm font-black text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700">
        Pretraži
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">{bar}</div>

      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-between rounded-3xl bg-white px-5 py-4 text-left shadow-premium"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-600">
              Pretraga
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              Kategorija, država, regija, grad
            </p>
          </div>
          <span className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white">
            Otvori
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 p-4 backdrop-blur-sm md:hidden">
          <div className="mt-16 rounded-3xl bg-white p-4 shadow-premium">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Filteri</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-slate-100 px-4 py-2 font-black"
              >
                X
              </button>
            </div>
            {bar}
          </div>
        </div>
      )}
    </>
  );
}

function Card({
  item,
}: {
  item: {
    title: string;
    description: string;
    location: string;
    price: string;
    category: string;
    badge: string;
    emoji: string;
    gradient: string[];
  };
}) {
  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-premium">
      <div
        className="card-art relative h-48"
        style={
          {
            "--from": item.gradient[0],
            "--to": item.gradient[1],
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.05),rgba(0,0,0,.38))]" />

        <div className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide text-white backdrop-blur">
          {item.badge}
        </div>

        <button className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-lg shadow-lg">
          ♡
        </button>

        <div className="absolute bottom-5 left-5 text-6xl drop-shadow-xl">
          {item.emoji}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">
            {item.category}
          </span>
          <span className="text-xs font-bold text-slate-400">Verifikovano</span>
        </div>

        <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">
          {item.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500">
          <span>📍</span> {item.location}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-black uppercase text-slate-400">Cena</p>
            <p className="text-xl font-black text-slate-950">{item.price}</p>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600">
            Detalji
          </button>
        </div>
      </div>
    </article>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="text-2xl font-black tracking-tight">
          Rezervisi<span className="text-rose-600">.to</span>
        </div>

        <nav className="no-scrollbar hidden max-w-3xl gap-1 overflow-x-auto rounded-full bg-slate-100 p-1 xl:flex">
          {navTabs.map((tab) => (
            <button
              key={tab}
              className="shrink-0 rounded-full px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-white hover:text-rose-600 hover:shadow-sm"
            >
              {tab}
            </button>
          ))}
        </nav>

        <a
          href="/dodaj-uslugu"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600"
        >
          Dodaj uslugu
        </a>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 xl:hidden">
        {navTabs.map((tab) => (
          <button
            key={tab}
            className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700"
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden lg:block">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4 pt-16">
          <div className="card-art h-56 rounded-[32px] shadow-premium" style={{"--from":"#fb7185","--to":"#f97316"} as React.CSSProperties}>
            <div className="flex h-full items-end p-6 text-6xl">🏛️</div>
          </div>
          <div className="card-art h-44 rounded-[32px] shadow-premium" style={{"--from":"#0ea5e9","--to":"#6366f1"} as React.CSSProperties}>
            <div className="flex h-full items-end p-6 text-6xl">🎤</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card-art h-44 rounded-[32px] shadow-premium" style={{"--from":"#f43f5e","--to":"#d946ef"} as React.CSSProperties}>
            <div className="flex h-full items-end p-6 text-6xl">🌸</div>
          </div>
          <div className="card-art h-64 rounded-[32px] shadow-premium" style={{"--from":"#334155","--to":"#64748b"} as React.CSSProperties}>
            <div className="flex h-full items-end p-6 text-6xl">📸</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 left-8 rounded-3xl bg-white p-5 shadow-premium">
        <p className="text-sm font-bold text-slate-500">Aktivnih ponuđača</p>
        <p className="text-4xl font-black">1.250+</p>
      </div>
    </div>
  );
}

function CategoryRail() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8">
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {categoryOptions.map((cat, index) => (
          <button
            key={cat}
            className="shrink-0 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-card"
          >
            <div className="text-2xl">{["🏛️", "🎤", "🌸", "💡", "📸", "💄", "✨"][index]}</div>
            <div className="mt-2 text-sm font-black text-slate-900">{cat}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Section({ title, category }: { title: string; category: string }) {
  const data = items.filter((item) => item.category === category);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">
            Preporučeno
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
            {title}
          </h2>
        </div>
        <button className="hidden rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-rose-600 md:block">
          Pogledaj sve
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(data.length ? data : items.slice(0, 4)).map((item) => (
          <Card key={`${title}-${item.title}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#ffe4e6,transparent_34%),radial-gradient(circle_at_top_right,#fed7aa,transparent_30%),linear-gradient(180deg,#fff,#f8fafc)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-rose-600 shadow-sm ring-1 ring-rose-100">
              ✨ Sve za event na jednom mestu
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
              Rezerviši event usluge brzo, moderno i bez haosa.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Prostori, muzika, dekoracije, efekti, foto & video i ulepšavanje za svadbe,
              rođendane, klubove i privatne događaje.
            </p>

            <div className="mt-8 max-w-5xl">
              <SearchBar />
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-slate-500">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">✓ Provereni ponuđači</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">✓ Srbija, BiH, dijaspora</span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">✓ Cene odmah vidljive</span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <CategoryRail />

      <div className="sticky top-[65px] z-40 hidden border-y border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-xl lg:block">
        <div className="mx-auto max-w-7xl">
          <SearchBar />
        </div>
      </div>

      {sections.map((section) => (
        <Section key={section.title} title={section.title} category={section.category} />
      ))}

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="overflow-hidden rounded-[36px] bg-slate-950 p-8 text-white shadow-premium md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-rose-300">
                Za ponuđače
              </p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">
                Imaš prostor, bend ili uslugu?
              </h2>
              <p className="mt-4 max-w-2xl text-white/70">
                Dodaj listing, prikaži cenu i lokaciju, i dobij upite od klijenata koji već planiraju event.
              </p>
            </div>

            <button className="rounded-full bg-white px-8 py-4 text-sm font-black text-slate-950 transition hover:bg-rose-100">
              Postani ponuđač
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
