import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const slug = searchParams.get("slug");

  if (!category || !slug) {
    return NextResponse.json(
      {
        success: false,
        error: "Nedostaje kategorija ili slug.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
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
    .eq("category_slug", category)
    .eq("service_slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: "Usluga nije pronađena.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}