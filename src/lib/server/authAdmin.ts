import "server-only";
import { createSign } from "node:crypto";

// Firebase Auth user management through the Identity Toolkit REST admin API.
// firebase-admin/auth is deliberately NOT used: its jose dependency fails to load on the Vercel
// runtime and took every route down once. This file signs its own service account JWT with
// node:crypto, exchanges it for an OAuth2 access token, and calls the REST endpoints directly.
//
// Environment: FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID), FIREBASE_CLIENT_EMAIL,
// FIREBASE_PRIVATE_KEY (with \n escapes). With FIREBASE_AUTH_EMULATOR_HOST set, no token is needed.

export type AuthAdminErrorCode =
  | "NOT_CONFIGURED"
  | "EMAIL_EXISTS"
  | "USER_NOT_FOUND"
  | "INVALID_EMAIL"
  | "INVALID_CONTINUE_URI"
  | "PERMISSION_DENIED"
  | "TOKEN_ERROR"
  | "NETWORK_ERROR"
  | "REQUEST_FAILED";

export class AuthAdminError extends Error {
  readonly code: AuthAdminErrorCode;
  readonly status: number;
  /** The raw Identity Toolkit message, for server logs only. */
  readonly detail: string;
  constructor(code: AuthAdminErrorCode, status = 500, detail = "") {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "AuthAdminError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

/** The user fields this app reads. Identity Toolkit sends times as strings or numbers of milliseconds. */
export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  emailVerified: boolean;
  claims: Record<string, unknown>;
  isAdmin: boolean;
  createdAt: number | null;
  lastSignInAt: number | null;
  passwordUpdatedAt: number | null;
};

type RawUser = {
  localId?: string;
  email?: string;
  displayName?: string;
  disabled?: boolean;
  emailVerified?: boolean;
  customAttributes?: string;
  createdAt?: string | number;
  lastLoginAt?: string | number;
  passwordUpdatedAt?: string | number;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = [
  "https://www.googleapis.com/auth/identitytoolkit",
  "https://www.googleapis.com/auth/cloud-platform",
];
const REQUEST_TIMEOUT_MS = 10000;

// ---------------------------------------------------------------------------------------------
// Access token minting

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

/** Builds and signs the RS256 JWT assertion that Google exchanges for an access token. */
export function buildAssertion(opts: {
  clientEmail: string;
  privateKey: string;
  nowSeconds: number;
  scopes?: string[];
  audience?: string;
}): string {
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: opts.clientEmail,
    scope: (opts.scopes ?? SCOPES).join(" "),
    aud: opts.audience ?? TOKEN_URL,
    iat: opts.nowSeconds,
    exp: opts.nowSeconds + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${b64url(signer.sign(opts.privateKey))}`;
}

type CachedToken = { token: string; expiresAt: number };
let cached: CachedToken | null = null;
let inflight: Promise<string> | null = null;

const REFRESH_MARGIN_MS = 5 * 60 * 1000;

function serviceAccount(): { clientEmail: string; privateKey: string } {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new AuthAdminError("NOT_CONFIGURED", 503, "service account variables are missing");
  return { clientEmail, privateKey };
}

async function mintAccessToken(): Promise<string> {
  const { clientEmail, privateKey } = serviceAccount();
  let assertion: string;
  try {
    assertion = buildAssertion({ clientEmail, privateKey, nowSeconds: Math.floor(Date.now() / 1000) });
  } catch {
    // Never include the key or the underlying crypto message, it can echo key material.
    throw new AuthAdminError("TOKEN_ERROR", 500, "could not sign the service account assertion");
  }
  let res: Response;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new AuthAdminError("NETWORK_ERROR", 502, "token endpoint unreachable");
  }
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) throw new AuthAdminError("TOKEN_ERROR", 502, data.error || `token exchange failed (${res.status})`);
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - REFRESH_MARGIN_MS) return cached.token;
  inflight ??= mintAccessToken().finally(() => {
    inflight = null;
  });
  return inflight;
}

// ---------------------------------------------------------------------------------------------
// REST plumbing

function projectId(): string {
  const id = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!id) throw new AuthAdminError("NOT_CONFIGURED", 503, "project id is missing");
  return id;
}

function baseUrl(): string {
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  return emulator
    ? `http://${emulator}/identitytoolkit.googleapis.com/v1`
    : "https://identitytoolkit.googleapis.com/v1";
}

async function authHeader(): Promise<string> {
  // The emulator accepts the literal token "owner" as an admin credential.
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) return "Bearer owner";
  return `Bearer ${await getAccessToken()}`;
}

function mapError(status: number, body: unknown): AuthAdminError {
  const raw = (body as { error?: { message?: string } } | null)?.error?.message ?? "";
  // Messages look like "EMAIL_EXISTS" or "INVALID_CONTINUE_URI : Domain not whitelisted".
  const key = raw.split(/[\s:]/)[0];
  switch (key) {
    case "EMAIL_EXISTS":
      return new AuthAdminError("EMAIL_EXISTS", 409, raw);
    case "EMAIL_NOT_FOUND":
    case "USER_NOT_FOUND":
      return new AuthAdminError("USER_NOT_FOUND", 404, raw);
    case "INVALID_EMAIL":
    case "MISSING_EMAIL":
      return new AuthAdminError("INVALID_EMAIL", 400, raw);
    case "INVALID_CONTINUE_URI":
    case "MISSING_CONTINUE_URI":
    case "UNAUTHORIZED_DOMAIN":
      return new AuthAdminError("INVALID_CONTINUE_URI", 400, raw);
    case "PERMISSION_DENIED":
      return new AuthAdminError("PERMISSION_DENIED", 502, raw);
    default:
      if (status === 401 || status === 403) return new AuthAdminError("PERMISSION_DENIED", 502, raw || `HTTP ${status}`);
      return new AuthAdminError("REQUEST_FAILED", 502, raw || `HTTP ${status}`);
  }
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
  const qs = query && Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : "";
  const url = `${baseUrl()}/projects/${encodeURIComponent(projectId())}${path}${qs}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { authorization: await authHeader(), "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof AuthAdminError) throw err;
    throw new AuthAdminError("NETWORK_ERROR", 502, "Identity Toolkit unreachable");
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw mapError(res.status, data);
  return data as T;
}

// ---------------------------------------------------------------------------------------------
// Users

function toMillis(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function parseClaims(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function toAuthUser(raw: RawUser): AuthUser {
  const claims = parseClaims(raw.customAttributes);
  const createdAt = toMillis(raw.createdAt);
  let lastSignInAt = toMillis(raw.lastLoginAt);
  // The Auth emulator stamps lastLoginAt at creation. A "sign in" within a second of creation
  // is that stamp, not a real sign in, so treat it as never signed in.
  if (lastSignInAt !== null && createdAt !== null && Math.abs(lastSignInAt - createdAt) < 1000) lastSignInAt = null;
  return {
    uid: raw.localId || "",
    email: raw.email || "",
    displayName: raw.displayName || "",
    disabled: raw.disabled === true,
    emailVerified: raw.emailVerified === true,
    claims,
    isAdmin: claims.admin === true,
    createdAt,
    lastSignInAt,
    passwordUpdatedAt: toMillis(raw.passwordUpdatedAt),
  };
}

/** Every user in the project, following nextPageToken. */
export async function listUsers(): Promise<AuthUser[]> {
  const out: AuthUser[] = [];
  let pageToken = "";
  for (let page = 0; page < 50; page++) {
    const query: Record<string, string> = { maxResults: "500" };
    if (pageToken) query.nextPageToken = pageToken;
    const data = await call<{ users?: RawUser[]; nextPageToken?: string }>("GET", "/accounts:batchGet", undefined, query);
    for (const u of data.users ?? []) out.push(toAuthUser(u));
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return out;
}

async function lookup(body: { email: string[] } | { localId: string[] }): Promise<AuthUser | null> {
  try {
    const data = await call<{ users?: RawUser[] }>("POST", "/accounts:lookup", body);
    const first = data.users?.[0];
    return first ? toAuthUser(first) : null;
  } catch (err) {
    if (err instanceof AuthAdminError && err.code === "USER_NOT_FOUND") return null;
    throw err;
  }
}

export function getUserByEmail(email: string): Promise<AuthUser | null> {
  return lookup({ email: [email] });
}

export function getUserByUid(uid: string): Promise<AuthUser | null> {
  return lookup({ localId: [uid] });
}

/** Creates a user with no password and an unverified email. */
export async function createUser(input: { email: string; displayName: string }): Promise<AuthUser> {
  const data = await call<RawUser>("POST", "/accounts", {
    email: input.email,
    displayName: input.displayName,
    emailVerified: false,
    disabled: false,
  });
  const user = await getUserByUid(data.localId || "");
  if (!user) throw new AuthAdminError("USER_NOT_FOUND", 502, "created user could not be read back");
  return user;
}

export type UserUpdate = {
  displayName?: string;
  disabled?: boolean;
  /** The full custom claims object. Replaces the existing claims. */
  claims?: Record<string, unknown>;
  /** Invalidates every refresh token issued before now, which signs the user out everywhere. */
  revokeSessions?: boolean;
};

export async function updateUser(uid: string, update: UserUpdate): Promise<AuthUser> {
  const body: Record<string, unknown> = { localId: uid };
  if (update.displayName !== undefined) body.displayName = update.displayName;
  if (update.disabled !== undefined) body.disableUser = update.disabled;
  if (update.claims !== undefined) body.customAttributes = JSON.stringify(update.claims);
  if (update.revokeSessions) body.validSince = String(Math.floor(Date.now() / 1000));
  await call<RawUser>("POST", "/accounts:update", body);
  const user = await getUserByUid(uid);
  if (!user) throw new AuthAdminError("USER_NOT_FOUND", 404, "user not found after update");
  return user;
}

/** Sets or removes the admin claim while keeping any other claims. */
export function setAdminClaim(user: AuthUser, admin: boolean, extra: Omit<UserUpdate, "claims"> = {}): Promise<AuthUser> {
  const claims = { ...user.claims };
  if (admin) claims.admin = true;
  else delete claims.admin;
  return updateUser(user.uid, { ...extra, claims });
}

/**
 * A password setup or reset link for the user. Firebase does not send an email: returnOobLink
 * hands the link back so it can go out through Resend or be shown to the inviting admin.
 */
export async function generatePasswordLink(email: string, continueUrl?: string): Promise<string> {
  const send = async (withContinue: boolean) => {
    const body: Record<string, unknown> = { requestType: "PASSWORD_RESET", email, returnOobLink: true };
    if (withContinue && continueUrl) {
      body.continueUrl = continueUrl;
      body.canHandleCodeInApp = false;
    }
    return call<{ oobLink?: string }>("POST", "/accounts:sendOobCode", body);
  };
  let data: { oobLink?: string };
  try {
    data = await send(true);
  } catch (err) {
    // An unauthorized continue domain should not stop the link from being created.
    if (err instanceof AuthAdminError && err.code === "INVALID_CONTINUE_URI") data = await send(false);
    else throw err;
  }
  if (!data.oobLink) throw new AuthAdminError("REQUEST_FAILED", 502, "no link was returned");
  return data.oobLink;
}
