"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logOut, useAuth } from "./auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/sales", label: "Sales" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/settings", label: "Settings" },
];

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="adm-center">
      <div className="notice">
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}

/** Frame for every admin page. Only renders its children for a signed in admin. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, configured } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (configured && !loading && !user) router.replace("/admin/login");
  }, [configured, loading, user, router]);

  if (!configured) {
    return (
      <Notice title="Firebase is not connected">
        <p>
          Add the NEXT_PUBLIC_FIREBASE variables to .env.local (or to Vercel) and restart. The README lists every step.
        </p>
      </Notice>
    );
  }
  if (loading || !user) {
    return (
      <div className="adm-center">
        <p>Loading</p>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <Notice title="You no longer have access">
        <p>
          {user.email} is signed in but does not have admin access. If you should have access, ask your administrator to
          restore it, then sign in again.
        </p>
        <button className="abtn" type="button" onClick={() => logOut()}>
          Sign out
        </button>
      </Notice>
    );
  }

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link className="mark" href="/admin">
          <span>Imperium</span>
          <span>Solutions</span>
        </Link>
        <nav aria-label="Admin">
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="adm-user">
          <span>{user.email}</span>
          <button className="abtn abtn--quiet" type="button" onClick={() => logOut()}>
            Sign out
          </button>
          <Link href="/">View site</Link>
        </div>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}
