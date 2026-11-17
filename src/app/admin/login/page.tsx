"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useAuth } from "@/components/admin/auth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch {
      setError("That email and password do not match an admin account.");
      setBusy(false);
    }
  }

  return (
    <div className="adm-center">
      <form className="login" onSubmit={submit}>
        <div className="mark">
          <span>Imperium</span>
          <span>Solutions</span>
        </div>
        <h1>Admin sign in</h1>
        {!isFirebaseConfigured ? (
          <p className="login-err">Firebase is not connected. Add the NEXT_PUBLIC_FIREBASE variables first.</p>
        ) : null}
        <label className="afield">
          <span>Email</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="afield">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="login-err" role="alert">
            {error}
          </p>
        ) : null}
        <button className="abtn abtn--primary" type="submit" disabled={busy || !isFirebaseConfigured}>
          {busy ? "Signing in" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
