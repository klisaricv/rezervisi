"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/Header";

const categories = [
  "Prostori (svadbeni saloni, restorani, vile, sale, klubovi, hoteli)",
  "Muzika (bendovi, solo izvođači, DJ, trubači, tamburaši)",
  "Dekoracije (cveće, baloni, mladenački sto, dekor sale, pozivnice)",
  "Efekti & Rasveta (rasveta, dim, konfete, vatromet, led ekrani)",
  "Foto & Video (fotografi, snimatelji, dron, video montaža)",
  "Ulepšavanje (šminka, frizura, nokti, beauty timovi)",
  "Ostale usluge (torte, ketering, animatori, limuzine, hostese)",
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

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "heic",
  "heif",
  "bmp",
  "tif",
  "tiff",
];

const VIDEO_EXTENSIONS = [
  "mp4",
  "mov",
  "m4v",
  "webm",
  "ogv",
  "ogg",
  "3gp",
  "3gpp",
  "mpeg",
  "mpg",
];

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
  "image/x-tiff",
];

const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
  "video/ogg",
  "video/3gpp",
  "video/mpeg",
];

const MAX_IMAGE_SIZE_MB = 25;
const MAX_VIDEO_SIZE_MB = 300;

const COVER_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,image/bmp,image/tiff,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff";

const GALLERY_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,image/bmp,image/tiff,video/mp4,video/quicktime,video/x-m4v,video/webm,video/ogg,video/3gpp,video/mpeg,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff,.mp4,.mov,.m4v,.webm,.ogv,.ogg,.3gp,.3gpp,.mpeg,.mpg";

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function isImageFile(file: File) {
  const ext = getFileExtension(file.name);
  return IMAGE_MIME_TYPES.includes(file.type) || IMAGE_EXTENSIONS.includes(ext);
}

function isVideoFile(file: File) {
  const ext = getFileExtension(file.name);
  return VIDEO_MIME_TYPES.includes(file.type) || VIDEO_EXTENSIONS.includes(ext);
}

function getUploadContentType(file: File) {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }

  const ext = getFileExtension(file.name);

  const byExtension: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    heic: "image/heic",
    heif: "image/heif",
    bmp: "image/bmp",
    tif: "image/tiff",
    tiff: "image/tiff",

    mp4: "video/mp4",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    webm: "video/webm",
    ogv: "video/ogg",
    ogg: "video/ogg",
    "3gp": "video/3gpp",
    "3gpp": "video/3gpp",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
  };

  return byExtension[ext] || "application/octet-stream";
}

function getStoredFileType(file: File) {
  if (isImageFile(file)) return "image";
  if (isVideoFile(file)) return "video";
  return getUploadContentType(file);
}

function formatMb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function validateSingleFile(file: File, role: "cover" | "gallery") {
  const isImage = isImageFile(file);
  const isVideo = isVideoFile(file);

  if (role === "cover" && !isImage) {
    throw new Error(
      `Cover mora biti slika. Fajl "${file.name}" nije podržan kao cover.`
    );
  }

  if (role === "gallery" && !isImage && !isVideo) {
    throw new Error(
      `Fajl "${file.name}" nije podržan. Dozvoljene su slike i video fajlovi.`
    );
  }

  if (isImage && file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw new Error(
      `Slika "${file.name}" je prevelika (${formatMb(
        file.size
      )} MB). Maksimalno je ${MAX_IMAGE_SIZE_MB} MB po slici.`
    );
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    throw new Error(
      `Video "${file.name}" je prevelik (${formatMb(
        file.size
      )} MB). Maksimalno je ${MAX_VIDEO_SIZE_MB} MB po videu.`
    );
  }
}

function createSafeFileName(fileName: string) {
  const safeName = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/Đ/g, "dj")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safeName || "upload";
}

async function uploadFile(serviceId: string, file: File, folder: string) {
  const safeName = createSafeFileName(file.name);

  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const path = `${serviceId}/${folder}/${randomPart}-${safeName}`;
  const contentType = getUploadContentType(file);

  const { error } = await supabase.storage.from("service-media").upload(path, file, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload nije uspeo za "${file.name}": ${error.message}`);
  }

  return path;
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label} {required && <span className="text-rose-600">*</span>}
      </span>

      {children}

      {hint && (
        <span className="mt-2 block text-xs leading-5 text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

function SearchableMultiSelect({
  label,
  placeholder,
  options,
  selected,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const cleanOptions = Array.from(new Set(options.filter(Boolean)));

  const filteredOptions = cleanOptions.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function addCustom() {
    const value = search.trim();

    if (!value) return;

    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }

    setSearch("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <p className="mb-2 text-sm font-black text-slate-800">{label}</p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex min-h-[48px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold outline-none transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>{selected.length ? `${selected.length} izabrano` : placeholder}</span>
        <span>⌄</span>
      </button>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700"
            >
              {item} ×
            </button>
          ))}
        </div>
      )}

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži ili dodaj novo..."
            className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-rose-400"
          />

          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-slate-50"
              >
                {option}
                {selected.includes(option) && <span>✓</span>}
              </button>
            ))}

            {search.trim() &&
              !cleanOptions
                .map((item) => item.toLowerCase())
                .includes(search.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={addCustom}
                  className="mt-2 w-full rounded-xl bg-slate-950 px-3 py-2 text-left text-sm font-black text-white"
                >
                  + Dodaj novo: {search.trim()}
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddServicePage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");

  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [description, setDescription] = useState("");

  const [priceMode, setPriceMode] = useState<"agreement" | "price">("agreement");
  const [currency, setCurrency] = useState("EUR");
  const [priceFrom, setPriceFrom] = useState("");

  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [newUnavailableDate, setNewUnavailableDate] = useState("");

  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactInstagram, setContactInstagram] = useState("");
  const [contactFacebook, setContactFacebook] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // Honeypot anti-bot polje — pravi korisnik ga ne vidi.
  const [companyWebsite, setCompanyWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  function normalizeInstagram(value: string) {
    const cleaned = value.trim().replace(/\s/g, "");
    if (!cleaned) return "";
    return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
  }

  function validateFilesBeforeSubmit() {
    if (coverFile) {
      validateSingleFile(coverFile, "cover");
    }

    files.forEach((file) => {
      validateSingleFile(file, "gallery");
    });
  }

  async function cleanupFailedService(
    serviceId: string | null,
    uploadedStoragePaths: string[]
  ) {
    if (uploadedStoragePaths.length > 0) {
      await supabase.storage.from("service-media").remove(uploadedStoragePaths);
    }

    if (serviceId) {
      await supabase.from("service_media").delete().eq("service_id", serviceId);
      await supabase.from("services").delete().eq("id", serviceId);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage(null);

    // Ako je ovo popunjeno, skoro sigurno je bot.
    if (companyWebsite.trim()) {
      return setMessage({
        type: "error",
        text: "Zahtev nije validan.",
      });
    }

    const normalizedInstagram = normalizeInstagram(contactInstagram);

    const hasContact =
      contactPhone.trim() ||
      contactEmail.trim() ||
      normalizedInstagram ||
      contactFacebook.trim() ||
      contactWebsite.trim();

    if (!category) {
      return setMessage({
        type: "error",
        text: "Kategorija je obavezna.",
      });
    }

    if (title.trim().length < 3 || title.trim().length > 250) {
      return setMessage({
        type: "error",
        text: "Naziv mora imati između 3 i 250 karaktera.",
      });
    }

    if (!countries.length && !regions.length && !cities.length) {
      return setMessage({
        type: "error",
        text: "Izaberi područje dostupnosti.",
      });
    }

    if (
      description.trim().length > 0 &&
      (description.trim().length < 10 || description.trim().length > 1000)
    ) {
      return setMessage({
        type: "error",
        text: "Opis mora imati između 10 i 1000 karaktera ili ostani prazan.",
      });
    }

    if (priceMode === "price" && (!priceFrom || Number(priceFrom) <= 0)) {
      return setMessage({
        type: "error",
        text: "Unesi cenu ili izaberi Po dogovoru.",
      });
    }

    if (!hasContact) {
      return setMessage({
        type: "error",
        text: "Moraš uneti bar jedan kontakt: telefon, email, Instagram, Facebook ili web stranicu.",
      });
    }

    try {
      validateFilesBeforeSubmit();
    } catch (err: any) {
      return setMessage({
        type: "error",
        text: err?.message || "Jedan ili više fajlova nisu validni.",
      });
    }

    setLoading(true);

    let createdServiceId: string | null = null;
    const uploadedStoragePaths: string[] = [];

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim() || "",

        country: countries.join(", "),
        region: regions.join(", "),
        city: cities.join(", "),
        coverage_area: [...countries, ...regions, ...cities].filter(Boolean).join(", "),

        price_type: priceMode === "agreement" ? "agreement" : "fixed",
        price_from: priceMode === "agreement" ? null : Number(priceFrom),
        currency,

        availability_type: unavailableDates.length ? "blocked_dates" : "not_set",
        unavailable_dates: unavailableDates,

        contact_name: "Nije uneto",
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_instagram: normalizedInstagram || null,
        contact_facebook: contactFacebook.trim() || null,
        contact_website: contactWebsite.trim() || null,

        // Honeypot šaljemo i backendu, jer frontend zaštita sama nije dovoljna.
        company_website: companyWebsite,

        status: "pending",
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Greška pri kreiranju usluge.");
      }

      const data = result.data;
      createdServiceId = data?.id || null;

      if (!createdServiceId) {
        throw new Error("Usluga je kreirana, ali ID nije vraćen iz API-ja.");
      }

      let coverImagePath: string | null = null;

      if (coverFile) {
        coverImagePath = await uploadFile(createdServiceId, coverFile, "cover");
        uploadedStoragePaths.push(coverImagePath);

        const { error: updateCoverError } = await supabase
          .from("services")
          .update({
            cover_image_path: coverImagePath,
          })
          .eq("id", createdServiceId);

        if (updateCoverError) {
          throw new Error(
            `Cover slika je uploadovana, ali nije upisana u bazu: ${updateCoverError.message}`
          );
        }
      }

      if (files.length) {
        for (const file of files) {
          const path = await uploadFile(createdServiceId, file, "gallery");
          uploadedStoragePaths.push(path);

          const { error: mediaError } = await supabase.from("service_media").insert({
            service_id: createdServiceId,
            file_path: path,
            file_type: getStoredFileType(file),
            file_name: file.name,
          });

          if (mediaError) {
            throw new Error(
              `Fajl "${file.name}" je uploadovan, ali nije upisan u bazu: ${mediaError.message}`
            );
          }
        }
      }

      setMessage({
        type: "success",
        text: "Usluga je uspešno kreirana i čeka odobrenje.",
      });

      setCategory("");
      setTitle("");
      setCountries([]);
      setRegions([]);
      setCities([]);
      setDescription("");
      setPriceMode("agreement");
      setCurrency("EUR");
      setPriceFrom("");
      setUnavailableDates([]);
      setNewUnavailableDate("");
      setContactPhone("");
      setContactEmail("");
      setContactInstagram("");
      setContactFacebook("");
      setContactWebsite("");
      setCoverFile(null);
      setFiles([]);
      setCompanyWebsite("");
    } catch (err: any) {
      try {
        await cleanupFailedService(createdServiceId, uploadedStoragePaths);
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }

      setMessage({
        type: "error",
        text:
          err?.message ||
          "Greška pri kreiranju usluge. Listing nije sačuvan jer upload fajlova nije prošao.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader showAddButton={false} />

      <section className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
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

          <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-600">
            Novi listing
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-950">
            Dodaj uslugu
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Popuni osnovne podatke. Nakon slanja, usluga ide na proveru i nakon
            odobrenja se prikazuje u izabranoj kategoriji.
          </p>

          <div className="mt-8 grid gap-6">
            <Field label="Kategorija" required>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
              >
                <option value="">Izaberi kategoriju</option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Naziv usluge" required>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 250))}
                placeholder="npr. Villa Prestige, Royal Bend..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
              />
            </Field>

            <Field
              label="Dostupnost / Lokacija"
              required
              hint="Izaberi više država, regija i gradova gde ste dostupni. Ako opcija ne postoji, pretraži i dodaj novu. Od ovoga zavisi vidljivost u pretrazi korisnika."
            >
              <div className="grid gap-3 md:grid-cols-3">
                <SearchableMultiSelect
                  label="Države"
                  placeholder="Izaberi države"
                  options={Object.keys(locationData)}
                  selected={countries}
                  onChange={(values) => {
                    setCountries(values);
                    setRegions([]);
                    setCities([]);
                  }}
                />

                <SearchableMultiSelect
                  label="Regije"
                  placeholder="Izaberi regije"
                  options={regionOptions}
                  selected={regions}
                  onChange={(values) => {
                    setRegions(values);
                    setCities([]);
                  }}
                  disabled={!countries.length}
                />

                <SearchableMultiSelect
                  label="Gradovi"
                  placeholder="Izaberi gradove"
                  options={cityOptions}
                  selected={cities}
                  onChange={setCities}
                  disabled={!countries.length}
                />
              </div>
            </Field>

            <Field label="Zauzeti datumi">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="date"
                  value={newUnavailableDate}
                  onChange={(e) => setNewUnavailableDate(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-rose-400"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!newUnavailableDate) return;

                    if (!unavailableDates.includes(newUnavailableDate)) {
                      setUnavailableDates([...unavailableDates, newUnavailableDate]);
                    }

                    setNewUnavailableDate("");
                  }}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600"
                >
                  Dodaj zauzet datum
                </button>
              </div>

              {unavailableDates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {unavailableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() =>
                        setUnavailableDates(
                          unavailableDates.filter((item) => item !== date)
                        )
                      }
                      className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white"
                    >
                      {date} ×
                    </button>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Opis">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Opiši uslugu, kapacitet, opremu, uslove..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-rose-400 focus:bg-white"
              />
            </Field>

            <Field label="Cena" hint="Ako ne uneseš cenu, prikazuje se Po dogovoru.">
              <div className="grid gap-3 md:grid-cols-[160px_1fr_1fr]">
                <select
                  value={priceMode}
                  onChange={(e) =>
                    setPriceMode(e.target.value as "agreement" | "price")
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
                >
                  <option value="agreement">Po dogovoru</option>
                  <option value="price">Unesi cenu</option>
                </select>

                <select
                  value={currency}
                  disabled={priceMode === "agreement"}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none disabled:opacity-40 focus:border-rose-400 focus:bg-white"
                >
                  <option value="EUR">EUR</option>
                  <option value="BAM">KM</option>
                  <option value="RSD">RSD</option>
                </select>

                <input
                  value={priceFrom}
                  disabled={priceMode === "agreement"}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  type="number"
                  placeholder="npr. 500"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none disabled:opacity-40 focus:border-rose-400 focus:bg-white"
                />
              </div>
            </Field>

            <Field
              label="Kontakt"
              required
              hint="Obavezno je uneti bar jedan kontakt: telefon, email, Instagram, Facebook ili web stranicu. Instagram se prikazuje u formatu @naziv."
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Telefon"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
                />

                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
                />

                <input
                  value={contactInstagram}
                  onChange={(e) => setContactInstagram(e.target.value)}
                  onBlur={() => setContactInstagram(normalizeInstagram(contactInstagram))}
                  placeholder="@instagram"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
                />

                <input
                  value={contactFacebook}
                  onChange={(e) => setContactFacebook(e.target.value)}
                  placeholder="Facebook link ili naziv stranice"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
                />

                <input
                  value={contactWebsite}
                  onChange={(e) => setContactWebsite(e.target.value)}
                  placeholder="Web stranica"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white md:col-span-2"
                />
              </div>
            </Field>

            <Field
              label="Cover slika"
              hint={`Ova slika se prikazuje na vrhu kartice usluge. Dozvoljeno: JPG, PNG, WEBP, GIF, AVIF, HEIC, HEIF, BMP, TIFF. Maksimalno ${MAX_IMAGE_SIZE_MB} MB.`}
            >
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-rose-300 bg-rose-50/40 px-4 py-4 transition hover:bg-rose-50">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Upload cover slike
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Preporučeno: horizontalna slika
                  </p>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm">
                  Izaberi
                </span>

                <input
                  type="file"
                  accept={COVER_ACCEPT}
                  className="hidden"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </label>

              {coverFile && (
                <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {coverFile.name}
                </div>
              )}
            </Field>

            <Field
              label="Galerija / video"
              hint={`Dozvoljene su slike i video fajlovi. Slike maksimalno ${MAX_IMAGE_SIZE_MB} MB, video maksimalno ${MAX_VIDEO_SIZE_MB} MB po fajlu.`}
            >
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-rose-300 hover:bg-rose-50/40">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Upload dodatnih fajlova
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Slike ili video, više fajlova
                  </p>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm">
                  Izaberi
                </span>

                <input
                  type="file"
                  multiple
                  accept={GALLERY_ACCEPT}
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </Field>

            {message && (
              <div
                className={`rounded-2xl p-4 text-sm font-bold ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-rose-600 px-8 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Kreiranje..." : "Kreiraj uslugu"}
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">
            Pregled
          </p>

          <h2 className="mt-3 text-xl font-black text-slate-950">
            {title || "Naziv usluge"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {category || "Kategorija nije izabrana"}
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-400">Cena</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {priceMode === "agreement"
                ? "Po dogovoru"
                : `${priceFrom || "0"} ${currency}`}
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-400">Kontakt</p>
            <p className="mt-2 text-sm font-bold text-slate-700">
              {contactPhone ||
                contactEmail ||
                normalizeInstagram(contactInstagram) ||
                contactFacebook ||
                contactWebsite ||
                "Nije uneto"}
            </p>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Nakon odobrenja, usluga se prikazuje u izabranoj kategoriji i području
            dostupnosti.
          </p>
        </aside>
      </section>
    </main>
  );
}