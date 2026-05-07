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
  const reason = body.reason ? String(body.reason).trim() : null;

  const { data, error } = await supabaseAdmin
    .from("services")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
      rejected_by: auth.user?.id,
      is_featured: false,
      featured_at: null,
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