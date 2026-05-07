import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";

export async function requireAdminUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      status: 401,
      error: "Niste ulogovani.",
      user: null,
      admin: null,
    };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user?.email) {
    return {
      ok: false,
      status: 401,
      error: "Sesija nije validna.",
      user: null,
      admin: null,
    };
  }

  const { data: admin, error: adminError } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("email", userData.user.email)
    .eq("is_active", true)
    .single();

  if (adminError || !admin) {
    return {
      ok: false,
      status: 403,
      error: "Nemate admin pristup.",
      user: userData.user,
      admin: null,
    };
  }

  return {
    ok: true,
    status: 200,
    error: null,
    user: userData.user,
    admin,
  };
}