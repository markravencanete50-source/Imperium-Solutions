"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { buildZoneLists, zoneLabel, zoneOffsetLabel, type ZoneOption } from "@/lib/timezones";

// Searchable time zone picker (ARIA combobox with a listbox). The list opens in the flow of the page.

type Props = {
  id: string;
  value: string;
  onChange: (zone: string) => void;
  /** Extra zone ids that must be in the list, for example the one the browser reports. */
  extra?: string[];
};

const MAX_RESULTS = 60;

export default function TimeZoneSelect({ id, value, onChange, extra = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [at, setAt] = useState(0); // when the list was opened, for offsets such as GMT+8
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const extraKey = extra.join("|");

  const lists = useMemo(() => buildZoneLists(extraKey ? extraKey.split("|") : []), [extraKey]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/_/g, " ");
    const tokens = q.split(/\s+/).filter(Boolean);
    const match = (o: ZoneOption) => tokens.every((t) => o.search.includes(t));
    if (!tokens.length) return { common: lists.common, others: lists.others, total: lists.common.length + lists.others.length };
    const common = lists.common.filter(match);
    const others = lists.others.filter(match).slice(0, Math.max(MAX_RESULTS - common.length, 10));
    return { common, others, total: common.length + others.length };
  }, [lists, query]);

  const flat = useMemo(() => [...rows.common, ...rows.others], [rows]);

  // Keep the highlighted option on screen.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function show() {
    if (open) return;
    setAt(Date.now());
    setQuery("");
    const current = flat.findIndex((o) => o.id === value);
    setActive(current >= 0 ? current : 0);
    setOpen(true);
  }

  function pick(option: ZoneOption | undefined) {
    if (!option) return;
    onChange(option.id);
    setOpen(false);
    setQuery("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      const n = flat.length;
      if (n) setActive((a) => (e.key === "ArrowDown" ? (a + 1) % n : (a - 1 + n) % n));
    } else if (e.key === "Enter") {
      if (open) {
        e.preventDefault();
        pick(flat[active]);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        setQuery("");
      }
    } else if (e.key === "Home" && open && e.ctrlKey) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && open && e.ctrlKey) {
      e.preventDefault();
      setActive(Math.max(flat.length - 1, 0));
    }
  }

  const option = (o: ZoneOption, index: number) => (
    <li
      key={o.id}
      id={`${listId}-${index}`}
      role="option"
      data-index={index}
      aria-selected={o.id === value}
      className={`tz-opt${index === active ? " is-active" : ""}${o.id === value ? " is-current" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onMouseMove={() => index !== active && setActive(index)}
      onClick={() => pick(o)}
    >
      <span>{o.label}</span>
      <span className="tz-off">{at ? zoneOffsetLabel(o.id, new Date(at)) : ""}</span>
    </li>
  );

  return (
    <div
      className="tz"
      ref={wrapRef}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (open && (!next || !wrapRef.current?.contains(next))) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && flat.length ? `${listId}-${active}` : undefined}
        value={open ? query : zoneLabel(value)}
        placeholder={open ? "Search, for example Manila or EST" : undefined}
        onFocus={show}
        onClick={show}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKey}
      />
      <svg className="tz-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {open ? (
        <ul className="tz-list" id={listId} role="listbox" aria-label="Time zones" ref={listRef}>
          {flat.length === 0 ? (
            <li className="tz-none" role="presentation">
              No time zone matches that search.
            </li>
          ) : (
            <>
              {rows.common.length ? (
                <li className="tz-group" role="presentation">
                  Common time zones
                </li>
              ) : null}
              {rows.common.map((o, i) => option(o, i))}
              {rows.others.length ? (
                <li className="tz-group" role="presentation">
                  {query.trim() ? "More matches" : "All time zones"}
                </li>
              ) : null}
              {rows.others.map((o, i) => option(o, rows.common.length + i))}
            </>
          )}
        </ul>
      ) : null}
    </div>
  );
}
