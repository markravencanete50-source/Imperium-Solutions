import "server-only";

// Optional spam check and optional notification. Both are skipped when their
// environment variables are not set, so the site works before they are wired.

export async function verifyTurnstile(token: string, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** Sends the event to a Make.com (or n8n) webhook. Never throws. */
export async function notify(event: string, payload: Record<string, unknown>): Promise<void> {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, ...payload }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.error("notify failed", event, err);
  }
}
