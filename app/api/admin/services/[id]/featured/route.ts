import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../lib/adminAuth";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminUser(request);

  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  const body = await request.json().catch(() => ({}));
  const isFeatured = Boolean(body.is_featured);
  const featuredOrder = Number(body.featured_order || 0);

  const { data: current, error: currentError } = await supabaseAdmin
    .from("services")
    .select("id, status")
    .eq("id", params.id)
    .single();

  if (currentError || !current) {
    return NextResponse.json(
      { success: false, error: "Usluga nije pronađena." },
      { status: 404 }
    );
  }

  if (current.status !== "approved") {
    return NextResponse.json(
      {
        success: false,
        error: "Samo odobrene usluge mogu biti preporučene.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("services")
    .update({
      is_featured: isFeatured,
      featured_order: featuredOrder,
      featured_at: isFeatured ? new Date().toISOString() : null,
      featured_by: isFeatured ? auth.user?.id : null,
    })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}