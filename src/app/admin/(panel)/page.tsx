"use client";

import Link from "next/link";
import {
  COLLECTIONS,
  LEAD_STATUSES,
  OPEN_DEAL_STAGES,
  dateTime,
  label,
  money,
  monthKey,
  shortDate,
  toDate,
  type Booking,
  type Client,
  type Deal,
  type Lead,
  type Payment,
} from "@/lib/crm";
import { useCollection, useNow } from "@/components/admin/data";
import { BarChart, Empty, Kpi, PageTitle, Panel, Pill, RowChart } from "@/components/admin/ui";

export default function DashboardPage() {
  const leads = useCollection<Lead>(COLLECTIONS.leads);
  const deals = useCollection<Deal>(COLLECTIONS.deals);
  const clients = useCollection<Client>(COLLECTIONS.clients);
  const payments = useCollection<Payment>(COLLECTIONS.payments, "date");
  const bookings = useCollection<Booking>(COLLECTIONS.bookings, "slotStart", "asc");

  const now = new Date(useNow());
  const monthAgo = now.getTime() - 30 * 86400000;
  const newLeads = leads.data.filter((l) => (toDate(l.createdAt)?.getTime() ?? 0) >= monthAgo).length;
  const openDeals = deals.data.filter((d) => OPEN_DEAL_STAGES.includes(d.stage));
  const pipeline = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const active = clients.data.filter((c) => c.status === "active");
  const mrr = active.reduce((sum, c) => sum + (c.monthlyValue || 0), 0);
  const thisMonth = monthKey(now);
  const revenueMonth = payments.data
    .filter((p) => p.date?.startsWith(thisMonth))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Last six calendar months, oldest first.
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = monthKey(d);
    return {
      label: d.toLocaleDateString("en-US", { month: "short" }),
      value: payments.data.filter((p) => p.date?.startsWith(key)).reduce((sum, p) => sum + (p.amount || 0), 0),
    };
  });

  const byStatus = LEAD_STATUSES.map((s) => ({
    label: label(s),
    value: leads.data.filter((l) => l.status === s).length,
  }));

  const upcoming = bookings.data
    .filter((b) => b.status === "booked" && (toDate(b.slotStart)?.getTime() ?? 0) >= now.getTime())
    .slice(0, 5);

  const error = leads.error || deals.error || clients.error || payments.error || bookings.error;

  return (
    <>
      <PageTitle title="Dashboard" sub="Leads, pipeline, clients, and revenue at a glance." />
      {error ? <p className="adm-error">Could not load data: {error}</p> : null}

      <div className="kpis">
        <Kpi label="New leads" value={String(newLeads)} hint="Last 30 days" />
        <Kpi label="Open pipeline" value={money(pipeline)} hint={`${openDeals.length} open deals`} />
        <Kpi label="Active clients" value={String(active.length)} hint={`${clients.data.length} in total`} />
        <Kpi label="Monthly recurring" value={money(mrr)} hint="From active clients" />
        <Kpi label="Received this month" value={money(revenueMonth)} hint="Recorded payments" />
      </div>

      <div className="grid-2">
        <Panel title="Revenue received, last 6 months">
          <BarChart data={months} format={money} />
        </Panel>
        <Panel title="Leads by status">
          <RowChart data={byStatus} />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Upcoming consultations" action={<Link href="/admin/bookings">All bookings</Link>}>
          {upcoming.length ? (
            <ul className="list">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <b>{dateTime(b.slotStart)}</b>
                  <span>
                    {b.name}, {b.email}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No consultations booked.</Empty>
          )}
        </Panel>
        <Panel title="Newest leads" action={<Link href="/admin/leads">All leads</Link>}>
          {leads.data.length ? (
            <ul className="list">
              {leads.data.slice(0, 6).map((l) => (
                <li key={l.id}>
                  <b>{l.company || l.name}</b>
                  <span>
                    {label(l.type)}, {shortDate(l.createdAt)}
                  </span>
                  <Pill value={l.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No leads yet. They appear here as soon as the contact form is used.</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}
