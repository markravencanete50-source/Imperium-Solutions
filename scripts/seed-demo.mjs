// Fills the CRM with clearly fake demo records so the dashboard has something to show.
// Every record carries demo: true.
//   npm run seed:demo           add demo data
//   npm run seed:demo -- clear  remove all demo data
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initAdmin } from "./_admin.mjs";

initAdmin();
const db = getFirestore();
const COLLECTIONS = ["leads", "clients", "deals", "payments", "bookings"];

async function clear() {
  let removed = 0;
  for (const name of COLLECTIONS) {
    const snap = await db.collection(name).where("demo", "==", true).get();
    for (const doc of snap.docs) {
      await db.recursiveDelete(doc.ref);
      removed += 1;
    }
  }
  console.log(`Removed ${removed} demo records.`);
}

const daysAgo = (n) => Timestamp.fromDate(new Date(Date.now() - n * 86400000));
const isoDay = (d) => d.toISOString().slice(0, 10);

async function seed() {
  const batch = db.batch();
  const add = (name, data, id) => {
    const ref = id ? db.collection(name).doc(id) : db.collection(name).doc();
    batch.set(ref, { ...data, demo: true, updatedAt: data.createdAt });
    return ref;
  };

  const clients = [
    ["Demo Dental Group", "Healthcare", "Front office calls and scheduling, 3 agents", "active", 5400, 240],
    ["Demo Property Co", "Property management", "Tenant support and maintenance tickets, 4 agents", "active", 7200, 400],
    ["Demo Realty Team", "Real estate", "Listing coordination and lead follow up, 2 agents", "active", 3600, 150],
    ["Demo Outdoor Store", "Ecommerce", "Chat and email support, 2 agents", "onboarding", 3200, 12],
    ["Demo Learning Hub", "Education", "Admissions back office, 1 agent", "paused", 1800, 300],
  ].map(([name, industry, services, status, monthlyValue, age]) => ({
    ref: add("clients", {
      name, industry, services, status, monthlyValue,
      contactName: "Demo Contact", email: "contact@example.com",
      startDate: isoDay(new Date(Date.now() - age * 86400000)), notes: "", createdAt: daysAgo(age),
    }),
    name, status, monthlyValue,
  }));

  // One payment per month for the past year from clients that were active.
  const now = new Date();
  for (let m = 0; m < 12; m += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 5, 12);
    if (date > now) continue;
    for (const c of clients.slice(0, 3)) {
      if (m > 7 && c.name === "Demo Realty Team") continue;
      add("payments", {
        clientId: c.ref.id, clientName: c.name, amount: c.monthlyValue,
        date: isoDay(date), note: "Monthly invoice", createdAt: Timestamp.fromDate(date),
      });
    }
  }

  const leads = [
    ["Avery Stone", "Demo Clinic Partners", "estimate", "new", "hot", 1],
    ["Jordan Lee", "Demo Lettings", "consultation", "contacted", "medium", 3],
    ["Sam Rivera", "Demo Brokerage", "estimate", "qualified", "hot", 6],
    ["Taylor Brooks", "Demo SaaS Labs", "estimate", "proposal", "medium", 11],
    ["Casey Morgan", "Demo Outdoor Store", "consultation", "won", "hot", 20],
    ["Riley Chen", "Demo Crypto Desk", "estimate", "lost", "low", 28],
    ["Morgan Diaz", "Demo Tutoring", "manual", "new", "unrated", 2],
  ];
  for (const [name, company, type, status, temperature, age] of leads) {
    add("leads", {
      name, company, type, status, temperature,
      email: `${name.split(" ")[0].toLowerCase()}@example.com`,
      source: type === "manual" ? "referral" : "website",
      side: "Front office", coverage: "US business hours", teamSize: "2 to 5",
      need: "Demo record. Needs a support team to cover inbound calls and email.",
      createdAt: daysAgo(age),
    });
  }

  const deals = [
    ["Demo Clinic Partners support team", "Demo Clinic Partners", "discovery", 4800, 2],
    ["Demo Brokerage back office", "Demo Brokerage", "proposal", 3600, 6],
    ["Demo SaaS Labs tier 1 support", "Demo SaaS Labs", "negotiation", 9000, 11],
    ["Demo Outdoor Store chat team", "Demo Outdoor Store", "won", 3200, 20],
    ["Demo Crypto Desk night cover", "Demo Crypto Desk", "lost", 6000, 28],
  ];
  for (const [title, company, stage, value, age] of deals) {
    add("deals", {
      title, company, stage, value, billing: "monthly",
      expectedClose: isoDay(new Date(Date.now() + 14 * 86400000)),
      wonAt: stage === "won" ? daysAgo(age - 6) : null, createdAt: daysAgo(age),
    });
  }

  // Two upcoming consultations, at 14:00 and 15:00 UTC three days out.
  for (const [i, name] of [[0, "Avery Stone"], [1, "Jordan Lee"]]) {
    const start = new Date(Date.now() + 3 * 86400000);
    start.setUTCHours(14 + i, 0, 0, 0);
    add("bookings", {
      name, email: `${name.split(" ")[0].toLowerCase()}@example.com`, company: "Demo",
      slotStart: Timestamp.fromDate(start), slotEnd: Timestamp.fromDate(new Date(start.getTime() + 15 * 60000)),
      visitorTimezone: "America/New_York", status: "booked", createdAt: daysAgo(1),
    }, start.toISOString().replace(/[-:.]/g, ""));
  }

  await batch.commit();
  console.log("Demo data added. Remove it any time with: npm run seed:demo -- clear");
}

if (process.argv[2] === "clear") await clear();
else {
  await clear();
  await seed();
}
