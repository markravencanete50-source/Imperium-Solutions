"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

type AuthState = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, isAdmin: false, loading: true, configured: false });

/** Tracks the signed in user and whether their token carries the admin claim. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: isFirebaseConfigured,
    configured: isFirebaseConfigured,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onIdTokenChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        setState({ user: null, isAdmin: false, loading: false, configured: true });
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        setState({ user, isAdmin: token.claims.admin === true, loading: false, configured: true });
      } catch {
        setState({ user, isAdmin: false, loading: false, configured: true });
      }
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function logOut() {
  return signOut(getFirebaseAuth());
}
