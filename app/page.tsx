"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "../components/Header";
import { supabase } from "../lib/supabaseClient";

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

const sections = [
  { title: "Istaknuti prostori", categorySlug: "prostori", href: "/prostori" },
  { title: "Istaknuta muzika", categorySlug: "muzika", href: "/muzika" },
  { title: "Istaknute dekoracije", categorySlug: "dekoracije", href: "/dekoracije" },
  { title: "Efekti i rasveta", categorySlug: "efekti-rasveta", href: "/efekti-rasveta" },
  { title: "Foto & video", categorySlug: "foto-video", href: "/foto-video" },
  { title: "Ulepšavanje", categorySlug: "ulepsavanje", href: "/ulepsavanje" },
  { title: "Ostale usluge", categorySlug: "ostale-usluge", href: "/ostale-usluge" },
];

const categoryLabels: Record<string, string> = {
  prostori: "PROSTORI",
  muzika: "MUZIKA",
  dekoracije: "DEKORACIJE",
  "efekti-rasveta": "EFEKTI & RASVETA",
  "foto-video": "FOTO & VIDEO",
  ulepsavanje: "ULEPŠAVANJE",
  "ostale-usluge": "OSTALE USLUGE",
};

type ServiceMedia = {
  id: string;
  file_path: string;
  file_type: string | null;
  file_name: string | null;
  sort_order: number | null;
  created_at: string;
};

type Service = {
  id: string;
  title: string;
  category: string;
  status?: string | null;
  is_featured?: boolean | null;
  category_slug?: string | null;
  service_slug?: string | null;
  description: string;
  country: string | null;
  region: string | null;
  city: string | null;
  coverage_area: string | null;
  price_type: string;
  price_from: number | null;
  currency: string;
  cover_image_path?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  contact_instagram?: string | null;
  contact_facebook?: string | null;
  contact_website?: string | null;
  service_media?: ServiceMedia[];
};

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

  function getCategoryHref() {
    if (category === "Prostori") return "/prostori";
    if (category === "Muzika") return "/muzika";
    if (category === "Dekoracije") return "/dekoracije";
    if (category === "Efekti & Rasveta") return "/efekti-rasveta";
    if (category === "Foto & Video") return "/foto-video";
    if (category === "Ulepšavanje") return "/ulepsavanje";
    if (category === "Ostale usluge") return "/ostale-usluge";

    return "/";
  }

  function handleSearch() {
    window.location.href = getCategoryHref();
  }

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
        onChange={(value) => {
          setCountry(value);
          setRegion("");
          setCity("");
        }}
      />

      <CompactSelect
        label="Regija"
        value={region}
        options={regions}
        disabled={!country}
        onChange={(value) => {
          setRegion(value);
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

      <button
        type="button"
        onClick={handleSearch}
        className="m-2 rounded-2xl bg-rose-600 px-7 py-4 text-sm font-black text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700"
      >
        Pretraži
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">{bar}</div>

      <div className="md:hidden">
        <button
          type="button"
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
                type="button"
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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/Đ/g, "dj")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategorySlugFromService(service: Service) {
  if (service.category_slug) return service.category_slug;

  if (service.category.startsWith("Prostori")) return "prostori";
  if (service.category.startsWith("Muzika")) return "muzika";
  if (service.category.startsWith("Dekoracije")) return "dekoracije";
  if (service.category.startsWith("Efekti")) return "efekti-rasveta";
  if (service.category.startsWith("Foto")) return "foto-video";
  if (service.category.startsWith("Ulepšavanje")) return "ulepsavanje";
  if (service.category.startsWith("Ostale")) return "ostale-usluge";

  return "usluge";
}

function getCategoryLabel(service: Service) {
  const slug = getCategorySlugFromService(service);
  return categoryLabels[slug] || service.category;
}

function cleanLocationText(value: string) {
  return value
    .replaceAll("Države:", "")
    .replaceAll("Drzave:", "")
    .replaceAll("Regije:", "")
    .replaceAll("Gradovi:", "")
    .replaceAll("|", ",")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getLocationParts(service: Service) {
  if (service.coverage_area) {
    const cleaned = cleanLocationText(service.coverage_area);
    if (cleaned.length) return cleaned;
  }

  const fallback = [service.city, service.region, service.country]
    .filter(Boolean)
    .filter((item) => item !== "Nije precizirano") as string[];

  if (fallback.length) return fallback;

  return ["Lokacija nije precizirana"];
}

function getContact(service: Service) {
  if (service.contact_phone) return service.contact_phone;
  if (service.contact_email) return service.contact_email;
  if (service.contact_instagram) return service.contact_instagram;
  if (service.contact_facebook) return service.contact_facebook;
  if (service.contact_website) return service.contact_website;

  return "Kontakt nije unet";
}

function getPublicUrl(path?: string | null) {
  if (!path) return null;

  const { data } = supabase.storage.from("service-media").getPublicUrl(path);
  return data.publicUrl;
}

function getCoverImageUrl(service: Service) {
  const path =
    service.cover_image_path ||
    service.service_media?.find((media) => media.file_type?.startsWith("image/"))
      ?.file_path ||
    null;

  return getPublicUrl(path);
}

function FeaturedCard({ service }: { service: Service }) {
  const coverImageUrl = getCoverImageUrl(service);
  const locationParts = getLocationParts(service);
  const visibleLocations = locationParts.slice(0, 4);
  const extraLocationsCount = Math.max(locationParts.length - 4, 0);

  const detailCategory = getCategorySlugFromService(service);
  const detailSlug = service.service_slug || slugify(service.title) || service.id;

  const shortDescription =
    service.description && service.description.length > 150
      ? `${service.description.slice(0, 150).trim()}...`
      : service.description || "Opis nije dodat.";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_85px_rgba(15,23,42,0.14)]">
      <div className="relative h-[285px] overflow-hidden bg-gradient-to-br from-slate-100 via-rose-50 to-orange-50">
        {coverImageUrl ? (
          <>
            <img
              src={coverImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-35"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-slate-950/5" />

            <div className="absolute inset-x-4 top-4 bottom-4 z-10 rounded-[26px] border border-white/70 bg-white/35 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.10)] backdrop-blur-md">
              <div className="h-full w-full overflow-hidden rounded-[20px] bg-white/70">
                <img
                  src={coverImageUrl}
                  alt={service.title}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 text-6xl">
            🏛️
          </div>
        )}

        <div className="absolute left-5 top-5 z-20 rounded-full bg-slate-950/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-xl backdrop-blur-md">
          Preporučujemo
        </div>

        <button
          type="button"
          className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-xl text-slate-700 shadow-xl backdrop-blur transition hover:bg-rose-600 hover:text-white"
          aria-label="Sačuvaj"
        >
          ♡
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-600">
            {getCategoryLabel(service)}
          </span>

          <span className="rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
            ✓ Verifikovano
          </span>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-100 bg-gradient-to-br from-white via-slate-50/80 to-white p-5 shadow-sm">
          <h3 className="text-[27px] font-black leading-[1.08] tracking-tight text-slate-950">
            {service.title}
          </h3>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-rose-200 via-slate-200 to-transparent" />

          <p className="mt-4 min-h-[78px] text-[15px] leading-7 text-slate-600">
            {shortDescription}
          </p>
        </div>

        <div className="mt-4 rounded-[22px] border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-slate-100">
              📍
            </span>
            <span className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-400">
              Dostupnost
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleLocations.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm"
              >
                {item}
              </span>
            ))}

            {extraLocationsCount > 0 && (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-600 shadow-sm">
                +{extraLocationsCount}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-slate-100">
              ☎
            </span>
            <span className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-400">
              Kontakt
            </span>
          </div>

          <div className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="break-words text-[16px] font-black leading-6 text-slate-800">
              {getContact(service)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <a
            href={`/${detailCategory}/${detailSlug}`}
            className="flex w-full items-center justify-center rounded-[20px] bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-slate-950/15 transition hover:bg-rose-600 hover:shadow-rose-600/20"
          >
            Detalji
          </a>
        </div>
      </div>
    </article>
  );
}

function FeaturedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <div className="h-[285px] animate-pulse bg-slate-100" />

      <div className="space-y-4 p-6">
        <div className="flex justify-between gap-3">
          <div className="h-9 w-32 animate-pulse rounded-full bg-slate-100" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
        </div>

        <div className="h-44 animate-pulse rounded-[24px] bg-slate-100" />
        <div className="h-28 animate-pulse rounded-[22px] bg-slate-100" />
        <div className="h-28 animate-pulse rounded-[22px] bg-slate-100" />
        <div className="h-14 animate-pulse rounded-[20px] bg-slate-100" />
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute -inset-6 rounded-[42px] bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_38%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/75 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.11)] backdrop-blur-2xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-100/70 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />

        <div className="relative">
          <div className="rounded-[30px] border border-slate-100 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
            <div className="mx-auto flex h-[120px] max-w-[420px] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-50 via-white to-rose-50/40 px-6 shadow-inner ring-1 ring-slate-100">
              <img
                src="/rezervisi-logo-full.png"
                alt="Rezervisi.to"
                className="h-auto w-full scale-[1.15] object-contain"
              />
            </div>

            <div className="mt-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-600">
                Organizacija bez stresa
              </p>

              <h3 className="mx-auto mt-2 max-w-[440px] text-[28px] font-black leading-[1.05] tracking-tight text-slate-950">
                Sve za tvoju proslavu — brzo i pregledno.
              </h3>

              <p className="mx-auto mt-3 max-w-[470px] text-[13px] leading-6 text-slate-600">
                Bez beskonačnog traganja po Instagramu, YouTube-u, Google-u i
                drugim platformama — ovde možeš pronaći prostor, muziku,
                dekoraciju, fotografa, efekte i sve ostalo na jednom mestu.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-[22px] border border-white/80 bg-white/85 p-4 text-center shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <p className="text-lg font-black leading-tight text-slate-950">
                Sve usluge
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Na jednom mestu
              </p>
            </div>

            <div className="rounded-[22px] border border-white/80 bg-white/85 p-4 text-center shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <p className="text-lg font-black leading-tight text-slate-950">
                Manje traženja
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Više izbora
              </p>
            </div>

            <div className="rounded-[22px] border border-white/80 bg-white/85 p-4 text-center shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <p className="text-lg font-black leading-tight text-slate-950">
                Direktan upit
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Bez komplikacija
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_20px_55px_rgba(15,23,42,0.20)]">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
                  Za svadbe, rođendane i proslave
                </p>

                <p className="mt-2 text-xl font-black">
                  Pronađi. Uporedi. Kontaktiraj.
                </p>

                <p className="mt-2 max-w-[410px] text-[13px] leading-5 text-white/65">
                  Pregledaj ponudu, otvori detalje i pošalji upit direktno
                  ponuđaču — bez posrednika i izgubljenog vremena.
                </p>
              </div>

              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-2xl font-black text-slate-950 shadow-xl md:flex">
                ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  categorySlug,
  href,
  services,
}: {
  title: string;
  categorySlug: string;
  href: string;
  services: Service[];
}) {
  const data = services.filter((service) => {
    return (
      service.status === "approved" &&
      service.is_featured === true &&
      getCategorySlugFromService(service) === categorySlug
    );
  });

  if (!data.length) return null;

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

        <a
          href={href}
          className="hidden rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-rose-600 md:block"
        >
          Pogledaj sve
        </a>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {data.slice(0, 3).map((service) => (
          <FeaturedCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  const filterRef = useRef<HTMLDivElement | null>(null);
  const [filterFixed, setFilterFixed] = useState(false);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    async function loadFeaturedServices() {
      try {
        setLoadingFeatured(true);

        const response = await fetch(`/api/home/featured?ts=${Date.now()}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (result.success) {
          const cleanFeatured = (result.data || []).filter((service: Service) => {
            return service.status === "approved" && service.is_featured === true;
          });

          setFeaturedServices(cleanFeatured);
        } else {
          setFeaturedServices([]);
        }
      } catch {
        setFeaturedServices([]);
      } finally {
        setLoadingFeatured(false);
      }
    }

    loadFeaturedServices();
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (!filterRef.current) return;

      const rect = filterRef.current.getBoundingClientRect();
      const headerOffset = window.innerWidth >= 1280 ? 125 : 84;

      setFilterFixed(rect.top <= headerOffset);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const hasFeatured = featuredServices.length > 0;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      {filterFixed && (
        <div className="fixed left-0 right-0 top-[84px] z-40 border-y border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl xl:top-[125px]">
          <div className="mx-auto max-w-7xl">
            <SearchBar />
          </div>
        </div>
      )}

      <section className="relative bg-[radial-gradient(circle_at_top_left,#ffe4e6,transparent_34%),radial-gradient(circle_at_top_right,#fed7aa,transparent_30%),linear-gradient(180deg,#fff,#f8fafc)]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 md:py-10 lg:grid-cols-[1.05fr_.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-rose-600 shadow-sm ring-1 ring-rose-100">
              ✨ Sve za event na jednom mestu
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl lg:text-[58px] lg:leading-[0.98]">
              Rezerviši event usluge brzo, moderno i bez haosa.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-[17px]">
              Prostori, muzika, dekoracije, efekti, foto & video i ulepšavanje za
              svadbe, rođendane, klubove i privatne događaje — bez beskonačnog
              traganja po Instagramu, YouTube-u, Google-u i drugim platformama.
            </p>

            <div
              ref={filterRef}
              className={`mt-7 transition-opacity duration-200 ${
                filterFixed ? "opacity-0" : "opacity-100"
              }`}
            >
              <SearchBar />
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-500">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                ✓ Provereni ponuđači
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                ✓ Srbija, BiH, dijaspora
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                ✓ Direktan kontakt
              </span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {loadingFeatured ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-6">
            <div className="h-5 w-32 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-3 h-10 w-80 max-w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <FeaturedCardSkeleton key={item} />
            ))}
          </div>
        </section>
      ) : hasFeatured ? (
        sections.map((section) => (
          <Section
            key={section.title}
            title={section.title}
            categorySlug={section.categorySlug}
            href={section.href}
            services={featuredServices}
          />
        ))
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="rounded-[34px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">
              Preporučeno
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Još nema preporučenih usluga
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
              Kada admin odobri usluge i označi ih kao preporučene, ovdje će se
              automatski prikazati prava ponuda iz baze.
            </p>

            <a
              href="/dodaj-uslugu"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition hover:bg-rose-600"
            >
              Dodaj uslugu
            </a>
          </div>
        </section>
      )}

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
                Dodaj listing, prikaži cenu i lokaciju, i dobij upite od
                klijenata koji već planiraju event.
              </p>
            </div>

            <a
              href="/dodaj-uslugu"
              className="rounded-full bg-white px-8 py-4 text-sm font-black text-slate-950 transition hover:bg-rose-100"
            >
              Postani ponuđač
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}