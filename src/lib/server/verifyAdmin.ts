import "server-only";

// Verifies a Firebase ID token and checks the admin custom claim.
// Uses the Identity Toolkit REST endpoint (Google validates the token) instead of
// firebase-admin/auth, whose jose dependency fails to load on the Vercel runtime.

export type AdminCheck = { ok: true; email: string; uid: string } | { ok: false; status: 401 | 403 | 503 };

type LookupUser = { localId?: string; email?: string; disabled?: boolean; customAttributes?: string };

export async function verifyAdminToken(idToken: string): Promise<AdminCheck> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return { ok: false, status: 503 };
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const base = emulator
    ? `http://${emulator}/identitytoolkit.googleapis.com/v1`
    : "https://identitytoolkit.googleapis.com/v1";
  try {
    const res = await fetch(`${base}/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, status: 401 };
    const data = (await res.json()) as { users?: LookupUser[] };
    const user = data.users?.[0];
    if (!user || user.disabled) return { ok: false, status: 401 };
    let claims: Record<string, unknown> = {};
    try {
      claims = user.customAttributes ? JSON.parse(user.customAttributes) : {};
    } catch {
      claims = {};
    }
    if (claims.admin !== true) return { ok: false, status: 403 };
    return { ok: true, email: user.email || "", uid: user.localId || "" };
  } catch {
    return { ok: false, status: 401 };
  }
}
