// Time zone list for the booking picker. Intl only, so it runs in the browser without any library.

export type ZoneOption = {
  id: string;
  label: string;
  /** Lower case text the search box matches against. */
  search: string;
};

// Labelled clearly for the markets the site serves. Order is the order shown.
const COMMON: { id: string; label: string; also?: string }[] = [
  { id: "UTC", label: "UTC, Coordinated Universal Time", also: "gmt utc zulu" },
  { id: "America/New_York", label: "Eastern Time (EST/EDT), New York", also: "est edt eastern us usa" },
  { id: "America/Chicago", label: "Central Time (CST/CDT), Chicago", also: "cst cdt central us usa" },
  { id: "America/Denver", label: "Mountain Time (MST/MDT), Denver", also: "mst mdt mountain us usa" },
  { id: "America/Phoenix", label: "Mountain Time, no daylight saving (MST), Phoenix", also: "mst arizona us usa" },
  { id: "America/Los_Angeles", label: "Pacific Time (PST/PDT), Los Angeles", also: "pst pdt pacific california us usa" },
  { id: "America/Anchorage", label: "Alaska Time (AKST/AKDT), Anchorage", also: "akst akdt alaska us usa" },
  { id: "Pacific/Honolulu", label: "Hawaii Time (HST), Honolulu", also: "hst hawaii us usa" },
  { id: "America/Toronto", label: "Eastern Time (EST/EDT), Toronto", also: "canada" },
  { id: "America/Vancouver", label: "Pacific Time (PST/PDT), Vancouver", also: "canada" },
  { id: "America/Sao_Paulo", label: "Brasilia Time (BRT), Sao Paulo", also: "brazil" },
  { id: "Europe/London", label: "United Kingdom (GMT/BST), London", also: "gmt bst uk britain england" },
  { id: "Europe/Dublin", label: "Ireland (GMT/IST), Dublin" },
  { id: "Europe/Paris", label: "Central European Time (CET/CEST), Paris", also: "cet cest europe france" },
  { id: "Europe/Berlin", label: "Central European Time (CET/CEST), Berlin", also: "cet cest europe germany" },
  { id: "Europe/Athens", label: "Eastern European Time (EET/EEST), Athens", also: "eet eest europe greece" },
  { id: "Europe/Moscow", label: "Moscow Time (MSK), Moscow", also: "msk russia" },
  { id: "Africa/Johannesburg", label: "South Africa Time (SAST), Johannesburg" },
  { id: "Asia/Dubai", label: "Gulf Time (GST), Dubai", also: "uae gulf" },
  { id: "Asia/Kolkata", label: "India Time (IST), Kolkata", also: "ist india calcutta mumbai delhi" },
  { id: "Asia/Singapore", label: "Singapore Time (SGT), Singapore" },
  { id: "Asia/Manila", label: "Philippines Time (PHT), Manila", also: "pht philippines" },
  { id: "Asia/Hong_Kong", label: "Hong Kong Time (HKT), Hong Kong" },
  { id: "Asia/Tokyo", label: "Japan Time (JST), Tokyo", also: "jst japan" },
  { id: "Australia/Sydney", label: "Australian Eastern Time (AEST/AEDT), Sydney", also: "aest aedt australia melbourne" },
  { id: "Australia/Perth", label: "Australian Western Time (AWST), Perth", also: "awst australia" },
  { id: "Pacific/Auckland", label: "New Zealand Time (NZST/NZDT), Auckland", also: "nzst nzdt new zealand" },
];

const FALLBACK_IDS = COMMON.map((c) => c.id);

function supported(): string[] {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    const list = fn ? fn("timeZone") : [];
    return list.length ? list : FALLBACK_IDS;
  } catch {
    return FALLBACK_IDS;
  }
}

/** "America/Argentina/Buenos_Aires" becomes "Buenos Aires (America/Argentina)". */
function plainLabel(id: string): string {
  const parts = id.split("/");
  const city = parts[parts.length - 1].replace(/_/g, " ");
  const region = parts.slice(0, -1).join("/").replace(/_/g, " ");
  return region ? `${city} (${region})` : city;
}

export type ZoneLists = { common: ZoneOption[]; others: ZoneOption[] };

/** The common zones first, then every other zone the browser knows. `extra` is always included (the detected zone). */
export function buildZoneLists(extra: string[] = []): ZoneLists {
  const common: ZoneOption[] = COMMON.map((c) => ({
    id: c.id,
    label: c.label,
    search: `${c.label} ${c.id} ${c.also || ""}`.replace(/_/g, " ").toLowerCase(),
  }));
  const taken = new Set(common.map((c) => c.id));
  const ids = [...supported(), ...extra].filter((id, i, all) => id && all.indexOf(id) === i);
  const others: ZoneOption[] = [];
  for (const id of ids) {
    if (taken.has(id)) continue;
    const label = plainLabel(id);
    others.push({ id, label, search: `${label} ${id}`.replace(/_/g, " ").toLowerCase() });
  }
  others.sort((a, b) => a.label.localeCompare(b.label));
  return { common, others };
}

/** Whether the zone has a hand written label that already names its abbreviation. */
export function isCommonZone(id: string): boolean {
  return COMMON.some((c) => c.id === id);
}

/** A readable name for any zone id. */
export function zoneLabel(id: string): string {
  const common = COMMON.find((c) => c.id === id);
  return common ? common.label : plainLabel(id);
}

/** Short name at a moment, for example "EST", "GMT+8". */
export function zoneAbbreviation(id: string, at: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: id, timeZoneName: "short" }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

/** Offset text such as "GMT+8" or "GMT-5" at a moment. */
export function zoneOffsetLabel(id: string, at: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: id, timeZoneName: "shortOffset" }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}
