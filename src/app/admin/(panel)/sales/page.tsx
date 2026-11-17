"use client";

import { useState, type FormEvent } from "react";
import { COLLECTIONS, money, monthKey, shortDate, toDate, type Client, type Deal, type Payment } from "@/lib/crm";
import { createRecord, removeRecord, useCollection, useNow } from "@/components/admin/data";
import { BarChart, ConfirmButton, Empty, Kpi, PageTitle, Panel } from "@/components/admin/ui";

const today = () => new Date().toLocaleDateString("en-CA");

export default function SalesPage() {
  const payments = useCollection<Payment>(COLLECTIONS.payments, "date");
  const clients = useCollection<Client>(COLLECTIONS.clients, "name", "asc");
  const deals = useCollection<Deal>(COLLECTIONS.deals);
  const [form, setForm] = useState({ clientId: "", amount: "", date: today(), note: "" });

  const now = new Date(useNow());
  const year = String(now.getFullYear());
  const thisMonth = monthKey(now);
  const sum = (list: Payment[]) => list.reduce((s, p) => s + (p.amount || 0), 0);
  const mrr = clients.data.filter((c) => c.status === "active").reduce((s, c) => s + (c.monthlyValue || 0), 0);
  const won = deals.data
    .filter((d) => d.stage === "won")
    .sort((a, b) => (toDate(b.wonAt)?.getTime() ?? 0) - (toDate(a.wonAt)?.getTime() ?? 0));
  const wonThisYear = won.filter((d) => String(toDate(d.wonAt)?.getFullYear() ?? "") === year);

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = monthKey(d);
    return {
      label: d.toLocaleDateString("en-US", { month: "short" }),
      value: sum(payments.data.filter((p) => p.date?.startsWith(key))),
    };
  });

  async function add(e: FormEvent) {
    e.preventDefault();
    const client = clients.data.find((c) => c.id === form.clientId);
    if (!client || !(Number(form.amount) > 0)) return;
    await createRecord(COLLECTIONS.payments, {
      clientId: client.id,
      clientName: client.name,
      amount: Number(form.amount),
      date: form.date,
      note: form.note.trim(),
    });
    setForm({ clientId: form.clientId, amount: "", date: today(), note: "" });
  }

  const error = payments.error || clients.error || deals.error;

  return (
    <>
      <PageTitle title="Sales" sub="Money received, recurring revenue, and deals won." />
      {error ? <p className="adm-error">Could not load sales: {error}</p> : null}

      <div className="kpis">
        <Kpi label="Monthly recurring" value={money(mrr)} hint="From active clients" />
        <Kpi label="Received this month" value={money(sum(payments.data.filter((p) => p.date?.startsWith(thisMonth))))} />
        <Kpi label={`Received in ${year}`} value={money(sum(payments.data.filter((p) => p.date?.startsWith(year))))} />
        <Kpi label={`Deals won in ${year}`} value={String(wonThisYear.length)} hint={money(wonThisYear.reduce((s, d) => s + (d.value || 0), 0))} />
      </div>

      <Panel title="Revenue received, last 12 months">
        <BarChart data={months} format={money} />
      </Panel>

      <div className="grid-2">
        <Panel title="Payments">
          <form className="pay-form" onSubmit={add}>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} aria-label="Client" required>
              <option value="">Choose a client</option>
              {clients.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} aria-label="Amount" required />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Date" required />
            <input placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} aria-label="Note" />
            <button className="abtn abtn--primary" type="submit">
              Record payment
            </button>
          </form>
          {payments.data.length ? (
            <div className="table-wrap">
              <table className="atable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th className="num">Amount</th>
                    <th>Note</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {payments.data.map((p) => (
                    <tr key={p.id}>
                      <td>{shortDate(p.date)}</td>
                      <td>{p.clientName}</td>
                      <td className="num">{money(p.amount)}</td>
                      <td>{p.note}</td>
                      <td>
                        <ConfirmButton label="Delete" onConfirm={() => removeRecord(COLLECTIONS.payments, p.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>No payments recorded yet.</Empty>
          )}
        </Panel>

        <Panel title="Deals won">
          {won.length ? (
            <ul className="list">
              {won.map((d) => (
                <li key={d.id}>
                  <b>{d.title}</b>
                  <span>
                    {money(d.value || 0)} {d.billing === "monthly" ? "per month" : "one time"}, {shortDate(d.wonAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No deals won yet. Move a deal to Won in the pipeline.</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}
