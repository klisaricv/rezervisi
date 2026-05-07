"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SiteHeader from "./Header";

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
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  }

  return (
    <div className="relative">
      <button
        disabled={disabled}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-16 w-full items-center justify-between border-r border-slate-100 px-4 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-300">
            {label}
          </span>
          <span className="mt-1 block text-sm font-black text-slate-950">
            {selected.length ? `${selected.length} izabrano` : placeholder}
          </span>
        </span>
        <span className="text-slate-300">⌄</span>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              {option}
              {selected.includes(option) && (
                <span className="text-rose-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
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

function getContact(service: Service) {
  if (service.contact_phone) return service.contact_phone;
  if (service.contact_email) return service.contact_email;
  if (service.contact_instagram) return service.contact_instagram;
  if (service.contact_facebook) return service.contact_facebook;
  if (service.contact_website) return service.contact_website;
  return "Kontakt nije unet";
}

function getCategoryLabel(service: Service) {
  const categorySlug = getCategorySlugFromService(service);

  if (categoryLabels[categorySlug]) {
    return categoryLabels[categorySlug];
  }

  return service.category;
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

function getCoverImageUrl(service: Service) {
  const path =
    service.cover_image_path ||
    service.service_media?.find((media) => media.file_type?.startsWith("image/"))
      ?.file_path ||
    null;

  if (!path) return null;

  const { data } = supabase.storage.from("service-media").getPublicUrl(path);
  return data.publicUrl;
}

function ServiceCard({ service }: { service: Service }) {
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

function ServiceCardSkeleton() {
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
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const regionOptions = useMemo(() => {
    return countries.flatMap((country) => Object.keys(locationData[country] || {}));
  }, [countries]);

  const cityOptions = useMemo(() => {
    if (!countries.length) return [];

    const result: string[] = [];

    countries.forEach((country) => {
      const countryRegions = locationData[country] || {};
      const activeRegions = regions.length ? regions : Object.keys(countryRegions);

      activeRegions.forEach((region) => {
        result.push(...(countryRegions[region] || []));
      });
    });

    return Array.from(new Set(result));
  }, [countries, regions]);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          category,
        });

        const response = await fetch(`/api/services?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
          setServices(result.data || []);
        } else {
          setServices([]);
        }
      } catch {
        setServices([]);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, [category]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const locationParts = getLocationParts(service);

      const countryMatch =
        countries.length === 0 ||
        countries.some((country) => locationParts.includes(country));

      const regionMatch =
        regions.length === 0 ||
        regions.some((region) => locationParts.includes(region));

      const cityMatch =
        cities.length === 0 ||
        cities.some((city) => locationParts.includes(city));

      return countryMatch && regionMatch && cityMatch;
    });
  }, [services, countries, regions, cities]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1320px] px-4 py-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-600">
              Rezervisi.to
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-950 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              {subtitle}
            </p>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 overflow-visible rounded-[26px] border border-slate-100 bg-white shadow-sm md:grid-cols-[1fr_1fr_1fr_150px]">
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
              setSelected={(values) => {
                setRegions(values);
                setCities([]);
              }}
              disabled={!countries.length}
            />

            <FilterSelect
              label="Grad"
              placeholder="Svi gradovi"
              options={cityOptions}
              selected={cities}
              setSelected={setCities}
              disabled={!countries.length}
            />

            <button className="m-2 rounded-2xl bg-rose-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
              Filtriraj
            </button>
          </div>

          {(countries.length > 0 || regions.length > 0 || cities.length > 0) && (
            <div className="mx-auto flex max-w-[1320px] flex-wrap gap-2 px-1 pt-4">
              {[...countries, ...regions, ...cities].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-[1320px] px-4 py-10">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <ServiceCardSkeleton key={item} />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center">
              <p className="text-lg font-black text-slate-950">
                Još nema odobrenih usluga u ovoj kategoriji.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}