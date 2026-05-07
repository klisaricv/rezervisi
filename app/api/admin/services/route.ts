import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "../../../../lib/adminAuth";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const auth = await requireAdminUser(request);

  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

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
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}