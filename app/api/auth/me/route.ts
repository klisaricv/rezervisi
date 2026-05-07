import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({
      success: true,
      user: null,
      isAdmin: false,
      admin: null,
    });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({
      success: true,
      user: null,
      isAdmin: false,
      admin: null,
    });
  }

  const email = userData.user.email;

  const { data: admin } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();

  return NextResponse.json({
    success: true,
    user: {
      id: userData.user.id,
      email: userData.user.email,
    },
    isAdmin: Boolean(admin),
    admin,
  });
}