"use client";

import { BOOKING_STATUSES, COLLECTIONS, label, toDate, type Booking } from "@/lib/crm";
import { updateRecord, useCollection, useNow } from "@/components/admin/data";
import { Empty, PageTitle, Panel } from "@/components/admin/ui";

const when = (b: Booking) =>
  toDate(b.slotStart)?.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }) ?? "";

function Table({ rows }: { rows: Booking[] }) {
  return (
    <div className="table-wrap">
      <table className="atable">
        <thead>
          <tr>
            <th>When (your time)</th>
            <th>Name</th>
            <th>Email</th>
            <th>Their time zone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>
                <b>{when(b)}</b>
              </td>
              <td>{b.name}</td>
              <td>
                <a href={`mailto:${b.email}`}>{b.email}</a>
              </td>
              <td>{(b.visitorTimezone || "").replace(/_/g, " ")}</td>
              <td>
                <select
                  value={b.status}
                  onChange={(e) => updateRecord(COLLECTIONS.bookings, b.id, { status: e.target.value })}
                  aria-label={`Status for ${b.name}`}
                >
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BookingsPage() {
  const { data, error } = useCollection<Booking>(COLLECTIONS.bookings, "slotStart", "asc");
  const now = useNow();
  const upcoming = data.filter((b) => (toDate(b.slotStart)?.getTime() ?? 0) >= now);
  const past = data.filter((b) => (toDate(b.slotStart)?.getTime() ?? 0) < now).reverse();

  return (
    <>
      <PageTitle
        title="Bookings"
        sub="Consultations booked on the website. Cancelling one frees the time for someone else."
      />
      {error ? <p className="adm-error">Could not load bookings: {error}</p> : null}
      <Panel title={`Upcoming (${upcoming.length})`}>
        {upcoming.length ? <Table rows={upcoming} /> : <Empty>No upcoming consultations.</Empty>}
      </Panel>
      <Panel title={`Past (${past.length})`}>
        {past.length ? <Table rows={past} /> : <Empty>Nothing here yet.</Empty>}
      </Panel>
    </>
  );
}
