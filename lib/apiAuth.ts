import { NextRequest } from "next/server";

export function requireAdminSecret(request: NextRequest) {
  const expectedSecret = process.env.ADMIN_API_SECRET;

  if (!expectedSecret) {
    return {
      ok: false,
      message: "ADMIN_API_SECRET is not configured.",
    };
  }

  const receivedSecret = request.headers.get("x-admin-secret");

  if (!receivedSecret || receivedSecret !== expectedSecret) {
    return {
      ok: false,
      message: "Unauthorized.",
    };
  }

  return {
    ok: true,
    message: "OK",
  };
}