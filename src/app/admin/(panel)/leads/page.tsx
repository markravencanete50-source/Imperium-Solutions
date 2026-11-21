"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  COLLECTIONS,
  LEAD_STATUSES,
  TEMPERATURES,
  dateTime,
  label,
  shortDate,
  EMAIL_KINDS,
  type Activity,
  type EmailLog,
  type Lead,
} from "@/lib/crm";
import { convertLead, createRecord, removeLead, updateRecord, useCollection } from "@/components/admin/data";
import { useAuth } from "@/components/admin/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { AField, ConfirmButton, Drawer, Empty, ErrorNote, PageTitle, Pill, useAction } from "@/components/admin/ui";

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const notes = useCollection<Activity>(`${COLLECTIONS.leads}/${lead.id}/activities`);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const { error, run } = useAction();
  const emails = useCollection<EmailLog>(`${COLLECTIONS.leads}/${lead.id}/emails`);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const mail = useAction();

  async function sendEmail(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const ok = await mail.run(async () => {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("you are signed out");
        const token = await current.getIdToken();
        const res = await fetch("/api/admin/email", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify({ leadId: lead.id, subject: subject.trim(), body: body.trim() }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
          if (data.error === "email_not_configured") throw new Error("email is not set up yet (RESEND_API_KEY is missing)");
          throw new Error(data.detail || data.error || `request failed (${res.status})`);
        }
      }, "Could not send the email");
      if (ok) {
        setSubject("");
        setBody("");
      }
    } finally {
      setSending(false);
    }
  }

  async function addNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    const ok = await run(
      () => createRecord(`${COLLECTIONS.leads}/${lead.id}/activities`, { text: note.trim(), by: user?.email || "" }),
      "Could not add the note"
    );
    if (ok) setNote("");
  }

  async function convert() {
    setBusy(true);
    try {
      const ok = await run(
        () =>
          convertLead(lead.id, {
            name: lead.company || lead.name,
            contactName: lead.name,
            email: lead.email,
            industry: "",
            services: [lead.side, lead.coverage].filter(Boolean).join(", "),
            status: "onboarding",
            monthlyValue: 0,
            startDate: lead.startDate || "",
            notes: lead.need || "",
            leadId: lead.id,
          }),
        "Could not convert the lead"
      );
      if (ok) router.push("/admin/clients");
    } finally {
      setBusy(false);
    }
  }

  async function createDeal() {
    setBusy(true);
    try {
      const ok = await run(async () => {
        await createRecord(COLLECTIONS.deals, {
          title: `${lead.company || lead.name} support team`,
          company: lead.company || lead.name,
          leadId: lead.id,
          stage: "discovery",
          value: 0,
          billing: "monthly",
          expectedClose: "",
        });
        if (lead.status === "new" || lead.status === "contacted") {
          await updateRecord(COLLECTIONS.leads, lead.id, { status: "qualified" });
        }
      }, "Could not create the deal");
      if (ok) router.push("/admin/pipeline");
    } finally {
      setBusy(false);
    }
  }

  const details: [string, string | undefined][] = [
    ["Email", lead.email],
    ["Company", lead.company],
    ["Type", label(lead.type)],
    ["Source", lead.source],
    ["Support needed", lead.side],
    ["Coverage", lead.coverage],
    ["Team size", lead.teamSize],
    ["Target start", lead.startDate ? shortDate(lead.startDate) : ""],
    ["Received", dateTime(lead.createdAt)],
  ];

  return (
    <Drawer title={lead.name} onClose={onClose}>
      <ErrorNote message={error} />
      <div className="form-row">
        <AField label="Status">
          <select
            value={lead.status}
            onChange={(e) => run(() => updateRecord(COLLECTIONS.leads, lead.id, { status: e.target.value }), "Could not update the status")}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </AField>
        <AField label="Rating">
          <select
            value={lead.temperature}
            onChange={(e) => run(() => updateRecord(COLLECTIONS.leads, lead.id, { temperature: e.target.value }), "Could not update the rating")}
          >
            {TEMPERATURES.map((t) => (
              <option key={t} value={t}>
                {label(t)}
              </option>
            ))}
          </select>
        </AField>
      </div>

      <dl className="details">
        {details
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{k === "Email" ? <a href={`mailto:${v}`}>{v}</a> : v}</dd>
            </div>
          ))}
      </dl>

      {lead.need ? (
        <>
          <h3>What they need</h3>
          <p className="prewrap">{lead.need}</p>
        </>
      ) : null}

      <div className="drawer-actions">
        <button className="abtn abtn--primary" type="button" disabled={busy} onClick={createDeal}>
          Create deal
        </button>
        {lead.clientId ? null : (
          <button className="abtn" type="button" disabled={busy} onClick={convert}>
            Convert to client
          </button>
        )}
        <ConfirmButton
          label="Delete lead"
          onConfirm={async () => {
            if (await run(() => removeLead(lead.id), "Could not delete the lead")) onClose();
          }}
        />
      </div>

      <h3>Email</h3>
      <ErrorNote message={mail.error} />
      <form className="note-form email-form" onSubmit={sendEmail}>
        <AField label={`To ${lead.email}`}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Subject" required />
        </AField>
        <AField label="Message">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={10000} rows={6} placeholder="Write your reply. Replies come to the team inbox." required />
        </AField>
        <button className="abtn abtn--primary" type="submit" disabled={sending || !subject.trim() || !body.trim()}>
          {sending ? "Sending" : "Send email"}
        </button>
      </form>
      {emails.data.length ? (
        <ul className="notes emails">
          {emails.data.map((m) => (
            <li key={m.id}>
              <p>
                <b>{m.subject}</b>
              </p>
              <span>
                {EMAIL_KINDS[m.kind] || label(m.kind)} to {m.to}. <span className={`pill pill--${m.status === "sent" ? "won" : m.status === "failed" ? "lost" : "new"}`}>{m.status}</span>{" "}
                {dateTime(m.createdAt)}
                {m.error ? ` Error: ${m.error}` : ""}
              </span>
              <details>
                <summary>Show text</summary>
                <p className="prewrap">{m.text}</p>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No emails yet.</Empty>
      )}

      <h3>Notes</h3>
      <form className="note-form" onSubmit={addNote}>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Call summary, next step, anything worth keeping" />
        <button className="abtn" type="submit">
          Add note
        </button>
      </form>
      {notes.data.length ? (
        <ul className="notes">
          {notes.data.map((n) => (
            <li key={n.id}>
              <p className="prewrap">{n.text}</p>
              <span>
                {n.by} {dateTime(n.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No notes yet.</Empty>
      )}
    </Drawer>
  );
}

function NewLeadDrawer({ onClose }: { onClose: () => void }) {
  const [v, setV] = useState({ name: "", email: "", company: "", need: "", source: "referral" });
  const { error, run } = useAction();
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const ok = await run(
      () =>
        createRecord(COLLECTIONS.leads, {
          ...v,
          email: v.email.trim().toLowerCase(),
          type: "manual",
          status: "new",
          temperature: "unrated",
        }),
      "Could not save the lead"
    );
    if (ok) onClose();
  }

  return (
    <Drawer title="Add a lead" onClose={onClose}>
      <ErrorNote message={error} />
      <form className="aform" onSubmit={submit}>
        <AField label="Name">
          <input value={v.name} onChange={set("name")} required />
        </AField>
        <AField label="Email">
          <input type="email" value={v.email} onChange={set("email")} required />
        </AField>
        <AField label="Company">
          <input value={v.company} onChange={set("company")} />
        </AField>
        <AField label="Source">
          <select value={v.source} onChange={set("source")}>
            <option value="referral">Referral</option>
            <option value="outreach">Outreach</option>
            <option value="upwork">Upwork</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </AField>
        <AField label="What they need">
          <textarea value={v.need} onChange={set("need")} />
        </AField>
        <button className="abtn abtn--primary" type="submit">
          Save lead
        </button>
      </form>
    </Drawer>
  );
}

export default function LeadsPage() {
  const { data, loading, error } = useCollection<Lead>(COLLECTIONS.leads);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState("");
  const [adding, setAdding] = useState(false);

  const term = search.trim().toLowerCase();
  const rows = data.filter(
    (l) =>
      (status === "all" || l.status === status) &&
      (!term || [l.name, l.email, l.company].some((f) => (f || "").toLowerCase().includes(term)))
  );
  const open = data.find((l) => l.id === openId);

  return (
    <>
      <PageTitle title="Leads" sub="Everyone who used the contact form, booked a call, or was added by hand.">
        <button className="abtn abtn--primary" type="button" onClick={() => setAdding(true)}>
          Add lead
        </button>
      </PageTitle>
      {error ? <p className="adm-error">Could not load leads: {error}</p> : null}

      <div className="toolbar">
        <input type="search" placeholder="Search name, email, or company" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search leads" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <span className="count">{rows.length} shown</span>
      </div>

      <div className="table-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Type</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>
                  <button className="rowlink" type="button" onClick={() => setOpenId(l.id)}>
                    <b>{l.name}</b>
                    <span>{l.company || l.email}</span>
                  </button>
                </td>
                <td>{label(l.type)}</td>
                <td>
                  <Pill value={l.status} />
                </td>
                <td>{l.temperature === "unrated" ? "" : <Pill value={l.temperature} />}</td>
                <td>{shortDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !rows.length ? <Empty>No leads match.</Empty> : null}
      </div>

      {open ? <LeadDrawer key={open.id} lead={open} onClose={() => setOpenId("")} /> : null}
      {adding ? <NewLeadDrawer onClose={() => setAdding(false)} /> : null}
    </>
  );
}
