"use client";

import { useState, type FormEvent } from "react";
import { CLIENT_STATUSES, COLLECTIONS, label, money, shortDate, type Client, type Payment } from "@/lib/crm";
import { createRecord, removeRecord, updateRecord, useCollection } from "@/components/admin/data";
import { AField, ConfirmButton, Drawer, Empty, Kpi, PageTitle, Pill } from "@/components/admin/ui";

type Draft = {
  name: string;
  contactName: string;
  email: string;
  industry: string;
  services: string;
  status: Client["status"];
  monthlyValue: string;
  startDate: string;
  notes: string;
};

const today = () => new Date().toLocaleDateString("en-CA");

function ClientDrawer({ client, payments, onClose }: { client: Client | null; payments: Payment[]; onClose: () => void }) {
  const [v, setV] = useState<Draft>({
    name: client?.name || "",
    contactName: client?.contactName || "",
    email: client?.email || "",
    industry: client?.industry || "",
    services: client?.services || "",
    status: client?.status || "onboarding",
    monthlyValue: client ? String(client.monthlyValue || 0) : "",
    startDate: client?.startDate || "",
    notes: client?.notes || "",
  });
  const [pay, setPay] = useState({ amount: "", date: today(), note: "" });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => {
    setSaved(false);
    setV((x) => ({ ...x, [k]: e.target.value }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const data = { ...v, name: v.name.trim(), monthlyValue: Number(v.monthlyValue) || 0 };
    if (client) {
      await updateRecord(COLLECTIONS.clients, client.id, data);
      setSaved(true);
    } else {
      await createRecord(COLLECTIONS.clients, data);
      onClose();
    }
  }

  async function addPayment(e: FormEvent) {
    e.preventDefault();
    if (!client || !(Number(pay.amount) > 0)) return;
    await createRecord(COLLECTIONS.payments, {
      clientId: client.id,
      clientName: client.name,
      amount: Number(pay.amount),
      date: pay.date,
      note: pay.note.trim(),
    });
    setPay({ amount: "", date: today(), note: "" });
  }

  const own = client ? payments.filter((p) => p.clientId === client.id) : [];
  const paid = own.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Drawer title={client ? client.name : "Add a client"} onClose={onClose}>
      <form className="aform" onSubmit={submit}>
        <AField label="Company">
          <input value={v.name} onChange={set("name")} required />
        </AField>
        <div className="form-row">
          <AField label="Contact name">
            <input value={v.contactName} onChange={set("contactName")} />
          </AField>
          <AField label="Contact email">
            <input type="email" value={v.email} onChange={set("email")} />
          </AField>
        </div>
        <div className="form-row">
          <AField label="Industry">
            <input value={v.industry} onChange={set("industry")} />
          </AField>
          <AField label="Status">
            <select value={v.status} onChange={set("status")}>
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </AField>
        </div>
        <AField label="Services we run">
          <input value={v.services} onChange={set("services")} placeholder="Front office chat and email, 2 agents" />
        </AField>
        <div className="form-row">
          <AField label="Monthly value in USD">
            <input type="number" min="0" step="1" value={v.monthlyValue} onChange={set("monthlyValue")} />
          </AField>
          <AField label="Start date">
            <input type="date" value={v.startDate} onChange={set("startDate")} />
          </AField>
        </div>
        <AField label="Notes">
          <textarea value={v.notes} onChange={set("notes")} />
        </AField>
        <div className="drawer-actions">
          <button className="abtn abtn--primary" type="submit">
            {client ? "Save changes" : "Save client"}
          </button>
          {saved ? <span className="saved">Saved</span> : null}
          {client ? (
            <ConfirmButton
              label="Delete client"
              onConfirm={async () => {
                await removeRecord(COLLECTIONS.clients, client.id);
                onClose();
              }}
            />
          ) : null}
        </div>
      </form>

      {client ? (
        <>
          <h3>Payments received: {money(paid)}</h3>
          <form className="pay-form" onSubmit={addPayment}>
            <input type="number" min="0" step="0.01" placeholder="Amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} aria-label="Amount" required />
            <input type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} aria-label="Date" required />
            <input placeholder="Note" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} aria-label="Note" />
            <button className="abtn" type="submit">
              Record payment
            </button>
          </form>
          {own.length ? (
            <ul className="notes">
              {own.map((p) => (
                <li key={p.id}>
                  <p>
                    <b>{money(p.amount)}</b> on {shortDate(p.date)} {p.note}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No payments recorded.</Empty>
          )}
        </>
      ) : null}
    </Drawer>
  );
}

export default function ClientsPage() {
  const { data, loading, error } = useCollection<Client>(COLLECTIONS.clients);
  const payments = useCollection<Payment>(COLLECTIONS.payments, "date");
  const [openId, setOpenId] = useState("");
  const [adding, setAdding] = useState(false);
  const open = data.find((c) => c.id === openId);
  const active = data.filter((c) => c.status === "active");

  return (
    <>
      <PageTitle title="Clients" sub="Every account, what we run for them, and what they are worth each month.">
        <button className="abtn abtn--primary" type="button" onClick={() => setAdding(true)}>
          Add client
        </button>
      </PageTitle>
      {error ? <p className="adm-error">Could not load clients: {error}</p> : null}

      <div className="kpis">
        <Kpi label="Active clients" value={String(active.length)} />
        <Kpi label="Onboarding" value={String(data.filter((c) => c.status === "onboarding").length)} />
        <Kpi label="Monthly recurring" value={money(active.reduce((s, c) => s + (c.monthlyValue || 0), 0))} />
      </div>

      <div className="table-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th>Client</th>
              <th>Services</th>
              <th>Status</th>
              <th className="num">Monthly value</th>
              <th>Since</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>
                  <button className="rowlink" type="button" onClick={() => setOpenId(c.id)}>
                    <b>{c.name}</b>
                    <span>{c.contactName || c.email}</span>
                  </button>
                </td>
                <td>{c.services}</td>
                <td>
                  <Pill value={c.status} />
                </td>
                <td className="num">{money(c.monthlyValue || 0)}</td>
                <td>{c.startDate ? shortDate(c.startDate) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !data.length ? <Empty>No clients yet. Convert a lead or add one by hand.</Empty> : null}
      </div>

      {open ? <ClientDrawer key={open.id} client={open} payments={payments.data} onClose={() => setOpenId("")} /> : null}
      {adding ? <ClientDrawer client={null} payments={[]} onClose={() => setAdding(false)} /> : null}
    </>
  );
}
