"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import SiteHeader from "../../../components/Header";

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
  availability_type?: string | null;
  unavailable_dates?: string[] | null;
  cover_image_path?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  contact_instagram?: string | null;
  contact_facebook?: string | null;
  contact_website?: string | null;
  created_at?: string | null;
  service_media?: ServiceMedia[];
};

type GalleryItem = {
  id: string;
  url: string;
  type: "image" | "video";
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

function getPublicUrl(path?: string | null) {
  if (!path) return null;

  const { data } = supabase.storage.from("service-media").getPublicUrl(path);
  return data.publicUrl;
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

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function getLocationParts(service: Service) {
  if (service.coverage_area) {
    const cleaned = cleanLocationText(service.coverage_area);
    if (cleaned.length) return uniqueItems(cleaned);
  }

  const fallback = [service.country, service.region, service.city]
    .filter(Boolean)
    .filter((item) => item !== "Nije precizirano") as string[];

  return uniqueItems(fallback);
}

function getCategoryLabel(service: Service) {
  if (service.category_slug && categoryLabels[service.category_slug]) {
    return categoryLabels[service.category_slug];
  }

  if (service.category.startsWith("Prostori")) return "PROSTORI";
  if (service.category.startsWith("Muzika")) return "MUZIKA";
  if (service.category.startsWith("Dekoracije")) return "DEKORACIJE";
  if (service.category.startsWith("Efekti")) return "EFEKTI & RASVETA";
  if (service.category.startsWith("Foto")) return "FOTO & VIDEO";
  if (service.category.startsWith("Ulepšavanje")) return "ULEPŠAVANJE";
  if (service.category.startsWith("Ostale")) return "OSTALE USLUGE";

  return service.category;
}

function priceLabel(service: Service) {
  if (service.price_type === "agreement" || !service.price_from) {
    return "Po dogovoru";
  }

  return `od ${service.price_from} ${service.currency}`;
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function normalizeLink(value?: string | null) {
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.055)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-base text-white shadow-lg shadow-slate-950/15">
          {icon}
        </span>

        <h2 className="text-lg font-black tracking-tight text-slate-950">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function ContactLink({
  href,
  label,
  icon,
  target,
}: {
  href: string;
  label: string;
  icon: string;
  target?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50">
        {icon}
      </span>
      <span className="break-all">{label}</span>
    </a>
  );
}

function DetailsLoader() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 lg:grid-cols-[1fr_430px]">
            <div className="space-y-5">
              <div className="flex gap-2">
                <div className="h-9 w-32 animate-pulse rounded-full bg-slate-100" />
                <div className="h-9 w-32 animate-pulse rounded-full bg-slate-100" />
              </div>

              <div className="h-12 w-4/5 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 w-full animate-pulse rounded-3xl bg-slate-100" />

              <div className="flex flex-wrap gap-2">
                <div className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
                <div className="h-10 w-32 animate-pulse rounded-full bg-slate-100" />
                <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>

            <div className="h-[320px] animate-pulse rounded-[32px] bg-slate-100" />
          </div>
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            <div className="h-52 animate-pulse rounded-[28px] bg-white" />
            <div className="h-36 animate-pulse rounded-[28px] bg-white" />
            <div className="h-72 animate-pulse rounded-[28px] bg-white" />
          </div>

          <div className="h-96 animate-pulse rounded-[30px] bg-white" />
        </section>
      </main>
    </div>
  );
}

function GalleryModal({
  items,
  activeIndex,
  onClose,
  onChange,
}: {
  items: GalleryItem[];
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const activeItem = items[activeIndex];

  if (!activeItem) return null;

  function previous() {
    onChange(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
  }

  function next() {
    onChange(activeIndex === items.length - 1 ? 0 : activeIndex + 1);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 p-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-black text-slate-950 shadow-xl transition hover:bg-rose-600 hover:text-white"
        aria-label="Zatvori"
      >
        ×
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            className="absolute left-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-950 shadow-xl transition hover:bg-rose-600 hover:text-white"
            aria-label="Prethodno"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-950 shadow-xl transition hover:bg-rose-600 hover:text-white"
            aria-label="Sledeće"
          >
            ›
          </button>
        </>
      )}

      <div className="flex h-full w-full items-center justify-center">
        <div className="relative max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-3 shadow-2xl">
          <div className="flex max-h-[82vh] min-h-[280px] items-center justify-center overflow-hidden rounded-[24px] bg-slate-950">
            {activeItem.type === "video" ? (
              <video
                src={activeItem.url}
                controls
                autoPlay
                className="max-h-[82vh] w-full object-contain"
              />
            ) : (
              <img
                src={activeItem.url}
                alt="Galerija"
                className="max-h-[82vh] w-full object-contain"
              />
            )}
          </div>

          <div className="mt-3 flex justify-center px-2 text-white">
            <p className="text-xs font-black opacity-60">
              {activeIndex + 1} / {items.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailsPage() {
  const params = useParams();

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/services/by-slug?category=${encodeURIComponent(
            String(category)
          )}&slug=${encodeURIComponent(String(slug))}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Usluga nije pronađena.");
        }

        setService(result.data);
      } catch (err: any) {
        setError(err?.message || "Greška pri učitavanju usluge.");
      } finally {
        setLoading(false);
      }
    }

    if (category && slug) {
      loadService();
    }
  }, [category, slug]);

  const mediaItems = useMemo(() => {
    if (!service) return [];

    return (service.service_media || [])
      .filter((item) => item.file_path)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [service]);

  const galleryItems = useMemo<GalleryItem[]>(() => {
    return mediaItems
      .map((item) => {
        const url = getPublicUrl(item.file_path);
        if (!url) return null;

        return {
          id: item.id,
          url,
          type: item.file_type?.startsWith("video/") ? "video" : "image",
        };
      })
      .filter(Boolean) as GalleryItem[];
  }, [mediaItems]);

  const coverUrl = useMemo(() => {
    if (!service) return null;

    return (
      getPublicUrl(service.cover_image_path) ||
      getPublicUrl(
        mediaItems.find((item) => item.file_type?.startsWith("image/"))?.file_path
      )
    );
  }, [service, mediaItems]);

  const locationParts = service ? getLocationParts(service) : [];
  const unavailableDates = service?.unavailable_dates || [];

  if (loading) {
    return <DetailsLoader />;
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />

        <main className="mx-auto max-w-[1180px] px-4 py-12">
          <div className="rounded-[30px] border border-rose-100 bg-white p-8 text-center shadow-sm">
            <p className="text-base font-black text-rose-600">
              {error || "Usluga nije pronađena."}
            </p>

            <a
              href="/"
              className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600"
            >
              Nazad na početnu
            </a>
          </div>
        </main>
      </div>
    );
  }

  const hasAnyContact =
    service.contact_phone ||
    service.contact_email ||
    service.contact_instagram ||
    service.contact_facebook ||
    service.contact_website;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      {activeGalleryIndex !== null && (
        <GalleryModal
          items={galleryItems}
          activeIndex={activeGalleryIndex}
          onClose={() => setActiveGalleryIndex(null)}
          onChange={setActiveGalleryIndex}
        />
      )}

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.10),transparent_34%)]" />

          <div className="relative mx-auto grid max-w-[1180px] gap-8 px-4 py-8 lg:grid-cols-[1fr_430px] lg:py-10">
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-600">
                  {getCategoryLabel(service)}
                </span>

                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                  ✓ Verifikovano
                </span>

                {service.created_at && (
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">
                    Dodato: {formatDate(service.created_at)}
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                {service.title}
              </h1>

              {service.description && (
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                  {service.description}
                </p>
              )}

              {locationParts.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {locationParts.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"
                    >
                      📍 {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.11)] backdrop-blur">
              <div className="relative h-[320px] overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-100 via-rose-50 to-orange-50">
                {coverUrl ? (
                  <>
                    <img
                      src={coverUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-35"
                    />

                    <img
                      src={coverUrl}
                      alt={service.title}
                      className="relative z-10 h-full w-full object-contain p-4"
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl">
                    🏛️
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            {service.description && (
              <SectionCard title="Opis usluge" icon="✦">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="whitespace-pre-line text-[15px] leading-8 text-slate-700">
                    {service.description}
                  </p>
                </div>
              </SectionCard>
            )}

            {locationParts.length > 0 && (
              <SectionCard title="Dostupnost" icon="📍">
                <div className="flex flex-wrap gap-2">
                  {locationParts.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}

            {(service.availability_type === "blocked_dates" ||
              unavailableDates.length > 0) && (
              <SectionCard title="Zauzeti datumi" icon="📅">
                {unavailableDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {unavailableDates.map((date) => (
                      <span
                        key={date}
                        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700"
                      >
                        {formatDate(date)}
                      </span>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {galleryItems.length > 0 && (
              <SectionCard title="Galerija" icon="🖼️">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveGalleryIndex(index)}
                      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-48 bg-slate-100">
                        {item.type === "video" ? (
                          <>
                            <video
                              src={item.url}
                              muted
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35">
                              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950 shadow-xl">
                                PLAY
                              </span>
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.url}
                            alt={service.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          <aside className="h-fit rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_65px_rgba(15,23,42,0.09)] lg:sticky lg:top-28">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-600">
              Kontakt
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              {service.title}
            </h2>

            <div className="mt-5 rounded-[24px] bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">
                Cena
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight">
                {priceLabel(service)}
              </p>
            </div>

            {hasAnyContact && (
              <div className="mt-5 grid gap-3">
                {service.contact_phone && (
                  <ContactLink
                    href={`tel:${service.contact_phone}`}
                    icon="☎"
                    label={service.contact_phone}
                  />
                )}

                {service.contact_email && (
                  <ContactLink
                    href={`mailto:${service.contact_email}`}
                    icon="✉"
                    label={service.contact_email}
                  />
                )}

                {service.contact_instagram && (
                  <ContactLink
                    href={`https://instagram.com/${service.contact_instagram.replace(
                      "@",
                      ""
                    )}`}
                    icon="◎"
                    label={`Instagram: ${service.contact_instagram}`}
                    target="_blank"
                  />
                )}

                {service.contact_facebook && (
                  <ContactLink
                    href={normalizeLink(service.contact_facebook) || "#"}
                    icon="f"
                    label="Facebook"
                    target="_blank"
                  />
                )}

                {service.contact_website && (
                  <ContactLink
                    href={normalizeLink(service.contact_website) || "#"}
                    icon="↗"
                    label="Web stranica"
                    target="_blank"
                  />
                )}
              </div>
            )}

            {service.contact_phone && (
              <a
                href={`tel:${service.contact_phone}`}
                className="mt-5 flex w-full items-center justify-center rounded-[20px] bg-rose-600 px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
              >
                Kontaktiraj odmah
              </a>
            )}

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              Podaci su prikazani na osnovu informacija koje je uneo pružalac usluge.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}