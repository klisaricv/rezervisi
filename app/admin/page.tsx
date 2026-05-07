"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/Header";

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
  status: "pending" | "approved" | "rejected" | "hidden";
  rejection_reason?: string | null;
  is_featured?: boolean | null;
  featured_order?: number | null;
  featured_at?: string | null;
  cover_image_path?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  contact_instagram?: string | null;
  contact_facebook?: string | null;
  contact_website?: string | null;
  created_at?: string | null;
  service_media?: ServiceMedia[];
};

type AdminUser = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
};

const statusTabs = [
  { label: "Na čekanju", value: "pending" },
  { label: "Odobreno", value: "approved" },
  { label: "Odbijeno", value: "rejected" },
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

function getLocationLabel(service: Service) {
  if (service.coverage_area) {
    const parts = cleanLocationText(service.coverage_area);

    if (parts.length) {
      return parts.slice(0, 5).join(", ");
    }
  }

  if (service.city && service.city !== "Nije precizirano") return service.city;
  if (service.region) return service.region;
  if (service.country) return service.country;

  return "Lokacija nije precizirana";
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

function formatDate(date?: string | null) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getPrimaryContact(service: Service) {
  if (service.contact_phone) return service.contact_phone;
  if (service.contact_email) return service.contact_email;
  if (service.contact_instagram) return service.contact_instagram;
  if (service.contact_facebook) return service.contact_facebook;
  if (service.contact_website) return service.contact_website;

  return "Nema kontakta";
}

function AdminSkeleton() {
  return (
    <div className="grid gap-5">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr]">
            <div className="h-44 animate-pulse rounded-[24px] bg-slate-100" />

            <div className="space-y-4">
              <div className="h-8 w-40 animate-pulse rounded-full bg-slate-100" />
              <div className="h-9 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceAdminCard({
  service,
  activeStatus,
  onApprove,
  onReject,
  onToggleFeatured,
  actionLoading,
}: {
  service: Service;
  activeStatus: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onToggleFeatured: (service: Service) => void;
  actionLoading: string | null;
}) {
  const coverImageUrl = getCoverImageUrl(service);
  const isLoading = actionLoading === service.id;

  const shortDescription =
    service.description && service.description.length > 220
      ? `${service.description.slice(0, 220).trim()}...`
      : service.description || "Opis nije dodat.";

  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <div className="grid gap-5 p-5 md:grid-cols-[230px_1fr]">
        <div className="relative h-48 overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-100 via-rose-50 to-orange-50 md:h-full">
          {coverImageUrl ? (
            <>
              <img
                src={coverImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-35"
              />

              <img
                src={coverImageUrl}
                alt={service.title}
                className="relative z-10 h-full w-full object-contain p-3"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              ✨
            </div>
          )}

          {service.is_featured && (
            <span className="absolute left-3 top-3 z-20 rounded-full bg-rose-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-lg">
              Preporučeno
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600">
              {getCategoryLabel(service)}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-black ${
                service.status === "approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : service.status === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {service.status === "approved"
                ? "ODOBRENO"
                : service.status === "rejected"
                  ? "ODBIJENO"
                  : "NA ČEKANJU"}
            </span>

            {service.created_at && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                {formatDate(service.created_at)}
              </span>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
            {service.title}
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {shortDescription}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Lokacija
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {getLocationLabel(service)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Kontakt
              </p>
              <p className="mt-1 break-words text-sm font-black text-slate-800">
                {getPrimaryContact(service)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Cena
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {priceLabel(service)}
              </p>
            </div>
          </div>

          {service.rejection_reason && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-400">
                Razlog odbijanja
              </p>
              <p className="mt-1 text-sm font-bold text-red-700">
                {service.rejection_reason}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {activeStatus === "pending" && (
              <>
                <button
                  disabled={isLoading}
                  onClick={() => onApprove(service.id)}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  Approve
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => onReject(service.id)}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
                >
                  Reject
                </button>
              </>
            )}

            {service.status === "approved" && (
              <button
                disabled={isLoading}
                onClick={() => onToggleFeatured(service)}
                className={`rounded-2xl px-5 py-3 text-sm font-black text-white shadow-lg transition disabled:opacity-60 ${
                  service.is_featured
                    ? "bg-slate-950 shadow-slate-950/15 hover:bg-slate-800"
                    : "bg-rose-600 shadow-rose-600/20 hover:bg-rose-700"
                }`}
              >
                {service.is_featured
                  ? "Ukloni iz preporučenih"
                  : "Dodaj u preporučeno"}
              </button>
            )}

            <a
              href={
                service.category_slug && service.service_slug
                  ? `/${service.category_slug}/${service.service_slug}`
                  : "#"
              }
              target="_blank"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              Pogledaj detalje
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [servicesLoading, setServicesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function checkAdmin() {
    setAuthLoading(true);
    setMessage("");

    const token = await getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!result.isAdmin) {
      window.location.href = "/";
      return;
    }

    setAdmin(result.admin);
    setAuthLoading(false);
  }

  async function loadServices(status = activeStatus) {
    const token = await getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setServicesLoading(true);
      setMessage("");

      const response = await fetch(`/api/admin/services?status=${status}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Greška pri učitavanju usluga.");
      }

      setServices(result.data || []);
    } catch (err: any) {
      setMessage(err?.message || "Greška pri učitavanju usluga.");
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }

  async function approveService(id: string) {
    const token = await getToken();

    if (!token) return;

    try {
      setActionLoading(id);
      setMessage("");

      const response = await fetch(`/api/admin/services/${id}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Greška pri odobravanju.");
      }

      setMessage("Usluga je odobrena.");
      await loadServices(activeStatus);
    } catch (err: any) {
      setMessage(err?.message || "Greška pri odobravanju.");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectService(id: string) {
    const token = await getToken();

    if (!token) return;

    const reason = window.prompt("Unesi razlog odbijanja:");

    try {
      setActionLoading(id);
      setMessage("");

      const response = await fetch(`/api/admin/services/${id}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Greška pri odbijanju.");
      }

      setMessage("Usluga je odbijena.");
      await loadServices(activeStatus);
    } catch (err: any) {
      setMessage(err?.message || "Greška pri odbijanju.");
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleFeatured(service: Service) {
    const token = await getToken();

    if (!token) return;

    try {
      setActionLoading(service.id);
      setMessage("");

      const response = await fetch(`/api/admin/services/${service.id}/featured`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_featured: !service.is_featured,
          featured_order: service.featured_order || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Greška pri promeni preporučenog statusa.");
      }

      setMessage(
        service.is_featured
          ? "Usluga je uklonjena iz preporučenih."
          : "Usluga je dodata u preporučeno."
      );

      await loadServices(activeStatus);
    } catch (err: any) {
      setMessage(err?.message || "Greška pri promeni preporučenog statusa.");
    } finally {
      setActionLoading(null);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (admin) {
      loadServices(activeStatus);
    }
  }, [admin, activeStatus]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <SiteHeader />

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-black text-slate-950">
              Provera admin pristupa...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-600">
              Admin panel
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Moderacija usluga
            </h1>

            <p className="mt-3 text-sm font-bold text-slate-500">
              Ulogovan admin: {admin?.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-fit rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-rose-600"
          >
            Logout
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-wrap gap-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`rounded-full px-5 py-3 text-sm font-black transition ${
                activeStatus === tab.value
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-rose-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm">
            {message}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        {servicesLoading ? (
          <AdminSkeleton />
        ) : services.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-black text-slate-950">
              Nema usluga za ovaj status.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {services.map((service) => (
              <ServiceAdminCard
                key={service.id}
                service={service}
                activeStatus={activeStatus}
                actionLoading={actionLoading}
                onApprove={approveService}
                onReject={rejectService}
                onToggleFeatured={toggleFeatured}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}