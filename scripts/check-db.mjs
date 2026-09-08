import fs from "fs";

const env = {};
try {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "").trim();
  }
} catch {
  /* no local env */
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
console.log("url-ok", /^https:\/\/.+\.supabase\.co/.test(url));
console.log("service-ok", Boolean(key) && key !== "[SENSITIVE]" && key.length > 20);

if (!url || !key || key === "[SENSITIVE]") {
  console.log("skip-query");
  process.exit(0);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

const tables = [
  "municipalities",
  "profiles",
  "intersections",
  "approaches",
  "devices",
  "alerts",
  "audit_events",
  "system_settings",
  "access_grants",
  "credential_overrides",
  "display_names",
  "field_technicians",
  "kpi_daily",
  "intersection_snapshots",
];

for (const table of tables) {
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}?select=*&limit=0`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  const range = res.headers.get("content-range") || String(res.status);
  console.log(`${table}\t${res.status}\t${range}`);
}
