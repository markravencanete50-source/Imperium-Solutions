"use client";

import { useState, type FormEvent } from "react";
import { COLLECTIONS, DEAL_STAGES, label, money, shortDate, type Deal, type DealStage } from "@/lib/crm";
import { createRecord, removeRecord, serverTimestamp, updateRecord, useCollection } from "@/components/admin/data";
import { AField, ConfirmButton, Drawer, ErrorNote, PageTitle, useAction } from "@/components/admin/ui";

function moveDeal(deal: Deal, stage: DealStage) {
  if (deal.stage === stage) return;
  return updateRecord(COLLECTIONS.deals, deal.id, {
    stage,
    // Stamp the win so Sales can report it by month.
    wonAt: stage === "won" ? serverTimestamp() : null,
  });
}

type Draft = { title: string; company: string; value: string; billing: Deal["billing"]; expectedClose: string };

function DealDrawer({ deal, onClose }: { deal: Deal | null; onClose: () => void }) {
  const [v, setV] = useState<Draft>({
    title: deal?.title || "",
    company: deal?.company || "",
    value: deal ? String(deal.value || 0) : "",
    billing: deal?.billing || "monthly",
    expectedClose: deal?.expectedClose || "",
  });
  // Only a stage the user picked here is written back; otherwise the live stage of the deal is kept.
  const [pickedStage, setPickedStage] = useState<DealStage | null>(null);
  const stage = pickedStage ?? deal?.stage ?? "discovery";
  const { error, run } = useAction();
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const data = {
      title: v.title.trim(),
      company: v.company.trim(),
      value: Number(v.value) || 0,
      billing: v.billing,
      expectedClose: v.expectedClose,
      stage,
    };
    const ok = await run(async () => {
      if (deal) {
        const wonChange = deal.stage !== stage ? { wonAt: stage === "won" ? serverTimestamp() : null } : {};
        await updateRecord(COLLECTIONS.deals, deal.id, { ...data, ...wonChange });
      } else {
        await createRecord(COLLECTIONS.deals, { ...data, wonAt: stage === "won" ? serverTimestamp() : null });
      }
    }, "Could not save the deal");
    if (ok) onClose();
  }

  return (
    <Drawer title={deal ? "Edit deal" : "Add a deal"} onClose={onClose}>
      <ErrorNote message={error} />
      <form className="aform" onSubmit={submit}>
        <AField label="Deal name">
          <input value={v.title} onChange={set("title")} required />
        </AField>
        <AField label="Company">
          <input value={v.company} onChange={set("company")} required />
        </AField>
        <div className="form-row">
          <AField label="Value in USD">
            <input type="number" min="0" step="1" value={v.value} onChange={set("value")} />
          </AField>
          <AField label="Billing">
            <select value={v.billing} onChange={set("billing")}>
              <option value="monthly">Per month</option>
              <option value="one_time">One time</option>
            </select>
          </AField>
        </div>
        <div className="form-row">
          <AField label="Stage">
            <select value={stage} onChange={(e) => setPickedStage(e.target.value as DealStage)}>
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </AField>
          <AField label="Expected close">
            <input type="date" value={v.expectedClose} onChange={set("expectedClose")} />
          </AField>
        </div>
        <div className="drawer-actions">
          <button className="abtn abtn--primary" type="submit">
            Save deal
          </button>
          {deal ? (
            <ConfirmButton
              label="Delete deal"
              onConfirm={async () => {
                if (await run(() => removeRecord(COLLECTIONS.deals, deal.id), "Could not delete the deal")) onClose();
              }}
            />
          ) : null}
        </div>
      </form>
    </Drawer>
  );
}

export default function PipelinePage() {
  const { data, error } = useCollection<Deal>(COLLECTIONS.deals);
  const [editingId, setEditingId] = useState("");
  const { error: writeError, run } = useAction();
  const move = (deal: Deal, stage: DealStage) => run(async () => moveDeal(deal, stage), "Could not move the deal");
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState("");
  const [over, setOver] = useState("");
  const editing = data.find((d) => d.id === editingId);

  return (
    <>
      <PageTitle title="Pipeline" sub="Drag a deal to a new stage, or open it to edit.">
        <button className="abtn abtn--primary" type="button" onClick={() => setAdding(true)}>
          Add deal
        </button>
      </PageTitle>
      {error ? <p className="adm-error">Could not load deals: {error}</p> : null}
      <ErrorNote message={writeError} />

      <div className="board">
        {DEAL_STAGES.map((stage) => {
          const deals = data.filter((d) => d.stage === stage);
          const total = deals.reduce((sum, d) => sum + (d.value || 0), 0);
          return (
            <section
              key={stage}
              className={`col col--${stage}${over === stage ? " is-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver((s) => (s === stage ? "" : s))}
              onDrop={(e) => {
                e.preventDefault();
                setOver("");
                const deal = data.find((d) => d.id === dragId);
                if (deal) move(deal, stage);
              }}
            >
              <header>
                <h2>{label(stage)}</h2>
                <span>
                  {deals.length} {deals.length === 1 ? "deal" : "deals"}, {money(total)}
                </span>
              </header>
              {deals.map((d) => (
                <article key={d.id} className="deal" draggable onDragStart={() => setDragId(d.id)} onDragEnd={() => setDragId("")}>
                  <button className="rowlink" type="button" onClick={() => setEditingId(d.id)}>
                    <b>{d.title}</b>
                    <span>{d.company}</span>
                  </button>
                  <p className="deal-val">
                    {money(d.value || 0)} {d.billing === "monthly" ? "per month" : "one time"}
                  </p>
                  {d.expectedClose ? <p className="deal-meta">Closes {shortDate(d.expectedClose)}</p> : null}
                  <select value={d.stage} onChange={(e) => move(d, e.target.value as DealStage)} aria-label={`Stage for ${d.title}`}>
                    {DEAL_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {label(s)}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
            </section>
          );
        })}
      </div>

      {editing ? <DealDrawer key={editing.id} deal={editing} onClose={() => setEditingId("")} /> : null}
      {adding ? <DealDrawer deal={null} onClose={() => setAdding(false)} /> : null}
    </>
  );
}
