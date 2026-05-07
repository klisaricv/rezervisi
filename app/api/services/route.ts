import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const allowedCategories = [
  "Prostori",
  "Muzika",
  "Dekoracije",
  "Efekti & Rasveta",
  "Foto & Video",
  "Ulepšavanje",
  "Ostale usluge",
  "Prostori (svadbeni saloni, restorani, vile, sale, klubovi, hoteli)",
  "Muzika (bendovi, solo izvođači, DJ, trubači, tamburaši)",
  "Dekoracije (cveće, baloni, mladenački sto, dekor sale, pozivnice)",
  "Efekti & Rasveta (rasveta, dim, konfete, vatromet, led ekrani)",
  "Foto & Video (fotografi, snimatelji, dron, video montaža)",
  "Ulepšavanje (šminka, frizura, nokti, beauty timovi)",
  "Ostale usluge (torte, ketering, animatori, limuzine, hostese)",
];

function getCategorySlug(category: string) {
  if (category.startsWith("Prostori")) return "prostori";
  if (category.startsWith("Muzika")) return "muzika";
  if (category.startsWith("Dekoracije")) return "dekoracije";
  if (category.startsWith("Efekti")) return "efekti-rasveta";
  if (category.startsWith("Foto")) return "foto-video";
  if (category.startsWith("Ulepšavanje")) return "ulepsavanje";
  if (category.startsWith("Ostale")) return "ostale-usluge";
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const country = searchParams.get("country");
  const region = searchParams.get("region");
  const city = searchParams.get("city");
  const q = searchParams.get("q");

  let query = supabaseAdmin
    .from("services")
    .select(
      `
      *,
      service_media (
        id,
        file_path,
        file_type,
        file_name,
        sort_order,
        created_at
      )
    `
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.or(`category.eq.${category},category_slug.eq.${category}`);
  }

  if (country) {
    query = query.ilike("country", `%${country}%`);
  }

  if (region) {
    query = query.ilike("region", `%${region}%`);
  }

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const title = String(body.title || "").trim();
    const category = String(body.category || "").trim();
    const description = String(body.description || "").trim();

    const contactPhone = body.contact_phone
      ? String(body.contact_phone).trim()
      : null;

    const contactEmail = body.contact_email
      ? String(body.contact_email).trim()
      : null;

    const contactInstagram = body.contact_instagram
      ? String(body.contact_instagram).trim()
      : null;

    const contactFacebook = body.contact_facebook
      ? String(body.contact_facebook).trim()
      : null;

    const contactWebsite = body.contact_website
      ? String(body.contact_website).trim()
      : null;

    if (!title || title.length < 3 || title.length > 250) {
      return NextResponse.json(
        {
          success: false,
          error: "Naziv mora imati između 3 i 250 karaktera.",
        },
        { status: 400 }
      );
    }

    if (!category || !allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategorija nije validna.",
        },
        { status: 400 }
      );
    }

    if (description && (description.length < 10 || description.length > 1000)) {
      return NextResponse.json(
        {
          success: false,
          error: "Opis mora imati između 10 i 1000 karaktera ili ostani prazan.",
        },
        { status: 400 }
      );
    }

    if (
      !contactPhone &&
      !contactEmail &&
      !contactInstagram &&
      !contactFacebook &&
      !contactWebsite
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Moraš uneti bar jedan kontakt.",
        },
        { status: 400 }
      );
    }

    const priceType = body.price_type === "fixed" ? "fixed" : "agreement";

    const priceFrom =
      priceType === "fixed" && body.price_from
        ? Number(body.price_from)
        : null;

    if (priceType === "fixed" && (!priceFrom || priceFrom <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Cena nije validna.",
        },
        { status: 400 }
      );
    }

    const payload = {
      title,
      category,
      category_slug: getCategorySlug(category),
      description,

      country: body.country || null,
      region: body.region || null,
      city: body.city || "Nije precizirano",
      coverage_area: body.coverage_area || null,

      price_type: priceType,
      price_from: priceFrom,
      currency: body.currency || "EUR",

      availability_type: body.availability_type || "not_set",
      unavailable_dates: Array.isArray(body.unavailable_dates)
        ? body.unavailable_dates
        : [],

      contact_name: body.contact_name || "Nije uneto",
      contact_phone: contactPhone,
      contact_email: contactEmail,
      contact_instagram: contactInstagram,
      contact_facebook: contactFacebook,
      contact_website: contactWebsite,

      status: "pending",
    };

    const { data, error } = await supabaseAdmin
      .from("services")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body.",
      },
      { status: 400 }
    );
  }
}