"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

type AuthState = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  /** Why the session was ended by the app (blocked or access changed). Shown on the login page. */
  signOutReason: string;
};

const AuthContext = createContext<AuthState>({
  user: null,
  isAdmin: false,
  loading: true,
  configured: false,
  signOutReason: "",
});

/** How often a signed in admin forces a token refresh, so blocked or revoked users are removed within minutes. */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export const BLOCKED_MESSAGE = "This account has been blocked. Contact your administrator.";
export const ACCESS_CHANGED_MESSAGE =
  "You no longer have access, or your session has ended. Sign in again. If you should still have access, contact your administrator.";

/** Refresh failures that mean the account was blocked, removed or had its sessions revoked. */
function kickOutMessage(err: unknown): string | null {
  const code = (err as { code?: string } | null)?.code;
  if (code === "auth/user-disabled") return BLOCKED_MESSAGE;
  if (code === "auth/user-token-expired" || code === "auth/user-not-found" || code === "auth/invalid-user-token") {
    return ACCESS_CHANGED_MESSAGE;
  }
  return null;
}

/** Tracks the signed in user and whether their token carries the admin claim. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: isFirebaseConfigured,
    configured: isFirebaseConfigured,
    signOutReason: "",
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onIdTokenChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        // Keep the reason so the login page can explain why the session ended.
        setState((s) => ({ user: null, isAdmin: false, loading: false, configured: true, signOutReason: s.signOutReason }));
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        setState({ user, isAdmin: token.claims.admin === true, loading: false, configured: true, signOutReason: "" });
      } catch {
        setState({ user, isAdmin: false, loading: false, configured: true, signOutReason: "" });
      }
    });
  }, []);

  // Firestore rules only read the admin claim from the ID token, which stays valid for up to an hour.
  // Forcing a refresh makes Firebase reject blocked users and users whose sessions were revoked.
  const uid = state.user?.uid;
  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;
    const auth = getFirebaseAuth();
    const refresh = async () => {
      const current = auth.currentUser;
      if (!current || current.uid !== uid) return;
      try {
        await current.getIdToken(true);
      } catch (err) {
        const message = kickOutMessage(err);
        if (!message) return; // a network hiccup must not sign anyone out
        setState((s) => ({ ...s, signOutReason: message }));
        await signOut(auth).catch(() => undefined);
      }
    };
    const timer = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    void refresh();
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [uid]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function logOut() {
  return signOut(getFirebaseAuth());
}
