import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET() {
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
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("featured_order", { ascending: true })
    .order("featured_at", { ascending: false })
    .limit(24);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
  });
}