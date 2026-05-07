import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    .eq("id", params.id)
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