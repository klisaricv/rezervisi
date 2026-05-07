import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    .order("featured_order", { ascending: true })
    .order("featured_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  const featured = (data || [])
    .filter((service) => service.is_featured === true)
    .slice(0, 24);

  return NextResponse.json(
    {
        success: true,
        data: data || [],
    },
    {
        headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        },
    }
    );
}