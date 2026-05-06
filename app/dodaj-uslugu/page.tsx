"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <a href="/" className="text-2xl font-black tracking-tight">
          Rezervisi<span className="text-rose-600">.to</span>
        </a>

        <nav className="hidden items-center gap-1 xl:flex">
          {navTabs.map((tab) => (
            <a
              key={tab}
              href="/"
              className="rounded-full px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-rose-600"
            >
              {tab}
            </a>
          ))}
        </nav>

        <div className="w-[118px]" />
      </div>
    </header>
  );
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
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-900">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>

      {children}

      {hint && <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
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
      <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex min-h-[48px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold outline-none transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className={selected.length ? "text-slate-900" : "text-slate-400"}>
          {selected.length ? `${selected.length} izabrano` : placeholder}
        </span>
        <span className="text-slate-400">⌄</span>
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
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži ili dodaj novo..."
            className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-rose-400"
          />

          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.map((option) => (
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

            {search.trim() &&
              !cleanOptions
                .map((item) => item.toLowerCase())
                .includes(search.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={addCustom}
                  className="mt-2 w-full rounded-xl bg-rose-50 px-3 py-2 text-left text-sm font-black text-rose-700"
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
  const [priceMode, setPriceMode] = useState<"agreement" | "price">(
    "agreement"
  );
  const [currency, setCurrency] = useState("EUR");
  const [priceFrom, setPriceFrom] = useState("");

  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [newUnavailableDate, setNewUnavailableDate] = useState("");

  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactInstagram, setContactInstagram] = useState("");
  const [contactFacebook, setContactFacebook] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  function normalizeInstagram(value: string) {
    const cleaned = value.trim().replace(/\s/g, "");

    if (!cleaned) return "";

    return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

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

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim() || "",

        country: countries.join(", "),
        region: regions.join(", "),
        city: cities.join(", ") || "Nije precizirano",
        coverage_area: [
          countries.length ? `Države: ${countries.join(", ")}` : "",
          regions.length ? `Regije: ${regions.join(", ")}` : "",
          cities.length ? `Gradovi: ${cities.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(" | "),

        price_type: priceMode === "agreement" ? "agreement" : "fixed",
        price_from: priceMode === "agreement" ? null : Number(priceFrom),
        currency,

        availability_type: unavailableDates.length
          ? "blocked_dates"
          : "not_set",
        unavailable_dates: unavailableDates,

        contact_name: "Nije uneto",
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_instagram: normalizedInstagram || null,
        contact_facebook: contactFacebook.trim() || null,
        contact_website: contactWebsite.trim() || null,

        status: "pending",
      };

      const { data, error } = await supabase
        .from("services")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;

      if (files.length && data?.id) {
        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
          const path = `${data.id}/${Date.now()}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("service-media")
            .upload(path, file);

          if (!uploadError) {
            await supabase.from("service_media").insert({
              service_id: data.id,
              file_path: path,
              file_type: file.type,
              file_name: file.name,
            });
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
      setFiles([]);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Greška pri kreiranju usluge.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-600">
              Novi listing
            </span>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Dodaj uslugu
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Popuni osnovne podatke. Nakon slanja, usluga ide na proveru i
              nakon odobrenja se prikazuje u izabranoj kategoriji.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:p-7"
        >
          <div className="grid gap-6">
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

            <Field label="Naziv" required hint={`${title.length}/250 karaktera`}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 250))}
                placeholder="npr. Villa Prestige, Royal Bend..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white"
              />
            </Field>

            <Field label="Područje dostupnosti" required>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-4 text-xs leading-5 text-slate-500">
                  Izaberi više država, regija i gradova gde ste dostupni. Ako
                  opcija ne postoji, pretraži i dodaj novu. Od ovoga zavisi
                  vidljivost u pretrazi korisnika.
                </p>

                <div className="grid gap-4">
                  <SearchableMultiSelect
                    label="Država"
                    placeholder="Izaberi državu"
                    options={Object.keys(locationData)}
                    selected={countries}
                    onChange={(values) => {
                      setCountries(values);
                      setRegions([]);
                      setCities([]);
                    }}
                  />

                  <SearchableMultiSelect
                    label="Regija"
                    placeholder="Izaberi regiju"
                    options={regionOptions}
                    selected={regions}
                    disabled={!countries.length}
                    onChange={(values) => {
                      setRegions(values);
                      setCities([]);
                    }}
                  />

                  <SearchableMultiSelect
                    label="Grad"
                    placeholder="Izaberi grad"
                    options={cityOptions}
                    selected={cities}
                    disabled={!countries.length}
                    onChange={setCities}
                  />
                </div>
              </div>
            </Field>

            <Field
              label="Dostupnost"
              hint="Nije obavezno, ali je preporučeno. Najlakše je uneti datume kada ste zauzeti, da korisnici znaju da li je usluga dostupna za njihov termin."
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
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
                        setUnavailableDates([
                          ...unavailableDates,
                          newUnavailableDate,
                        ]);
                      }

                      setNewUnavailableDate("");
                    }}
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600"
                  >
                    Dodaj zauzet datum
                  </button>
                </div>

                {unavailableDates.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
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
              </div>
            </Field>

            <Field
              label="Opis"
              hint={`${description.length}/1000 karaktera. Nije obavezno, ali je preporučeno uneti detalje.`}
            >
              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, 1000))
                }
                rows={4}
                placeholder="Opiši uslugu, kapacitet, opremu, uslove..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-rose-400 focus:bg-white"
              />
            </Field>

            <Field
              label="Cena"
              hint="Ako ne uneseš cenu, prikazuje se Po dogovoru."
            >
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
                  onBlur={() =>
                    setContactInstagram(normalizeInstagram(contactInstagram))
                  }
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

            <Field label="Slike / video">
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-rose-300 hover:bg-rose-50/40">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Upload fajlova
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
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {files.map((file) => (
                    <div
                      key={file.name}
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
              className="rounded-2xl bg-rose-600 px-8 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
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
            <p className="text-xs font-black uppercase text-slate-400">
              Kontakt
            </p>
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
            Nakon odobrenja, usluga se prikazuje u izabranoj kategoriji i
            području dostupnosti.
          </p>
        </aside>
      </section>
    </main>
  );
}