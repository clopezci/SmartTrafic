import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { AccessGrant } from "./access";
import { platformVariables } from "./demo-data";
import type { SystemVariable } from "./types";

const COOKIE = "st_vars";
const FLASH = "st_flash";
const GRANTS_KEY = "access.grantsJson";
const REVOKED_KEY = "access.revokedEmails";
const NAMES_KEY = "account.namesJson";
const PASSHASH_KEY = "account.passHashesJson";

let memory: Record<string, string> | undefined;

export const PLAN_VARIABLES: SystemVariable[] = [
  { key: "plan.esencial.name", label: "Esencial · nombre", value: "Esencial", scope: "platform", group: "Planes landing", hint: "Tarjeta 1 de la home." },
  { key: "plan.esencial.price", label: "Esencial · precio", value: "$1.5M / mes", scope: "platform", group: "Planes landing", hint: "Antes $1.0M. Default = +50%." },
  { key: "plan.esencial.blurb", label: "Esencial · texto", value: "Mesh, noche segura, alertas, tablero.", scope: "platform", group: "Planes landing", hint: "Una línea bajo el precio." },
  { key: "plan.adaptativo.name", label: "Adaptativo · nombre", value: "Adaptativo", scope: "platform", group: "Planes landing", hint: "Tarjeta 2 de la home." },
  { key: "plan.adaptativo.price", label: "Adaptativo · precio", value: "$2.25M / mes", scope: "platform", group: "Planes landing", hint: "Antes $1.5M. Default = +50%." },
  { key: "plan.adaptativo.blurb", label: "Adaptativo · texto", value: "IA de colas, reportes al alcalde, bloqueos.", scope: "platform", group: "Planes landing", hint: "Una línea bajo el precio." },
  { key: "plan.premium.name", label: "Premium · nombre", value: "Premium", scope: "platform", group: "Planes landing", hint: "Tarjeta 3 de la home." },
  { key: "plan.premium.price", label: "Premium · precio", value: "$3.15M / mes", scope: "platform", group: "Planes landing", hint: "Antes $2.1M. Default = +50%." },
  { key: "plan.premium.blurb", label: "Premium · texto", value: "Piso LED, audio, ambulancia, hospital.", scope: "platform", group: "Planes landing", hint: "Una línea bajo el precio." },
  { key: "plan.footnote", label: "Pie de los planes", value: "Por cruce. Tecnología en comodato. Postes del municipio.", scope: "platform", group: "Planes landing", hint: "Texto chico en las tres tarjetas." },
];

export const LANDING_VARIABLES: SystemVariable[] = [
  { key: "landing.pill", label: "Pastilla sobre el titular", value: "Fase 1 · plataforma municipal", scope: "platform", group: "Landing textos", hint: "Texto chico verde arriba del H1." },
  { key: "landing.hero1", label: "Titular · línea 1", value: "El municipio no necesita", scope: "platform", group: "Landing textos", hint: "Primera línea del H1." },
  { key: "landing.hero2", label: "Titular · línea 2 (acento)", value: "romper las calles", scope: "platform", group: "Landing textos", hint: "Va en verde." },
  { key: "landing.hero3", label: "Titular · línea 3", value: "para semaforizarse.", scope: "platform", group: "Landing textos", hint: "Cierre del H1." },
  { key: "landing.lead", label: "Párrafo de venta", value: "Control adaptativo a 100, 200 y 300 metros. Solar. Motos primero. El alcalde paga acero. El cerebro llega en comodato y se opera desde el celular.", scope: "platform", group: "Landing textos", hint: "Bajo el titular." },
  { key: "landing.ctaPrimary", label: "Botón principal", value: "Ver el tablero", scope: "platform", group: "Landing textos", hint: "Va a /entrar." },
  { key: "landing.ctaSecondary", label: "Botón secundario", value: "Ver la simulación", scope: "platform", group: "Landing textos", hint: "Va a /demo." },
  { key: "landing.muniBox", label: "Caja · del municipio", value: "Postes, báculos y obra menor\nCaras LED vehiculares y peatonales\nPaneles, soportes y gabinete metálico", scope: "platform", group: "Landing textos", hint: "Un ítem por línea." },
  { key: "landing.comodatoBox", label: "Caja · comodato", value: "Cerebro del cruce, ESP32, relés, módem\nCámaras / radar, firmware y plataforma\nSi no se renueva, se retira el cerebro. El acero se queda.", scope: "platform", group: "Landing textos", hint: "Un ítem por línea." },
];

export const EXTRA_PLATFORM_VARIABLES: SystemVariable[] = [
  { key: "contact.whatsapp", label: "WhatsApp comercial", value: "+57", scope: "platform", group: "Contacto", hint: "Número con indicativo. Vacío = no mostrar." },
  { key: "contact.email", label: "Correo comercial", value: "clpezci@gmail.com", scope: "platform", group: "Contacto", hint: "El que le das al alcalde." },
  { key: "contact.city", label: "Ciudad / base", value: "Colombia", scope: "platform", group: "Contacto", hint: "Texto libre." },
  { key: "feature.schoolHold", label: "Hold peatonal colegio", value: "true", scope: "platform", group: "Algoritmo", hint: "Respeta el mínimo peatonal aunque empuje el pelotón." },
  { key: "feature.failsafeAmber", label: "Ámbar seguro ante conflicto", value: "true", scope: "platform", group: "Algoritmo", hint: "Nunca verde contra verde." },
  { key: "eco.batteryThreshold", label: "Umbral Eco solar (%)", value: "20", scope: "platform", group: "Energía", hint: "Bajo este % se apagan auxiliares." },
  { key: "eco.autonomyDays", label: "Autonomía prometida (días)", value: "3", scope: "platform", group: "Energía", hint: "Texto comercial / tablero." },
  { key: "security.sessionDays", label: "Duración de sesión (días)", value: "7", scope: "platform", group: "Seguridad", hint: "Cookie de login." },
  { key: "security.inviteMaxDays", label: "Tope de días en invitaciones", value: "90", scope: "platform", group: "Seguridad", hint: "Nadie de prueba por encima de esto." },
  { key: "demo.showAccounts", label: "Mostrar cuentas demo en /entrar", value: "true", scope: "platform", group: "Demostración", hint: "true / false. Ocúltalas cuando entre un alcalde real." },
  { key: "demo.maintenance", label: "Aviso de mantenimiento", value: "false", scope: "platform", group: "Demostración", hint: "true = banner en login. El dueño siempre entra." },
  { key: "demo.maintenanceMessage", label: "Texto de mantenimiento", value: "Estamos en mantenimiento corto. Vuelve en unos minutos.", scope: "platform", group: "Demostración", hint: "Solo si el aviso está en true." },
  { key: "demo.lockLogins", label: "Cerrar logins (solo dueño)", value: "false", scope: "platform", group: "Demostración", hint: "true = nadie más entra. Útil si hay una demo privada." },
];

export const ALL_PLATFORM_FIELDS: SystemVariable[] = [
  ...LANDING_VARIABLES,
  ...PLAN_VARIABLES,
  ...EXTRA_PLATFORM_VARIABLES,
  ...platformVariables,
];

function secret(): string {
  return process.env.SESSION_SECRET || "smarttrafic-dev-only-change-me-32chars!!";
}

function encode(values: Record<string, string>): string {
  const body = Buffer.from(JSON.stringify(values), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function decode(token: string): Record<string, string> | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Record<string, string>;
  } catch {
    return null;
  }
}

export function defaultPlatformValues(): Record<string, string> {
  return Object.fromEntries(ALL_PLATFORM_FIELDS.map((v) => [v.key, v.value]));
}

export async function readSavedValues(): Promise<Record<string, string>> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  const fromCookie = raw ? decode(raw) : null;
  return {
    ...defaultPlatformValues(),
    ...(memory ?? {}),
    ...(fromCookie ?? {}),
  };
}

function slim(values: Record<string, string>): Record<string, string> {
  const defaults = defaultPlatformValues();
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key === GRANTS_KEY || key === REVOKED_KEY || key === NAMES_KEY || key === PASSHASH_KEY) {
      if (value) out[key] = value;
      continue;
    }
    if (key.startsWith("_")) continue;
    if (value !== defaults[key]) out[key] = value;
  }
  return out;
}

export async function savePlatformValues(patch: Record<string, string>): Promise<void> {
  const next = slim({ ...(await readSavedValues()), ...patch });
  memory = next;
  const jar = await cookies();
  jar.set(COOKIE, encode(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getMergedPlatformVariables(): Promise<SystemVariable[]> {
  const saved = await readSavedValues();
  return ALL_PLATFORM_FIELDS.map((v) => ({
    ...v,
    value: saved[v.key] ?? v.value,
  }));
}

export async function getLandingPlans(): Promise<
  { name: string; price: string; blurb: string; footnote: string }[]
> {
  const s = await readSavedValues();
  const footnote = s["plan.footnote"];
  return (["esencial", "adaptativo", "premium"] as const).map((id) => ({
    name: s[`plan.${id}.name`],
    price: s[`plan.${id}.price`],
    blurb: s[`plan.${id}.blurb`],
    footnote,
  }));
}

export async function getLandingCopy() {
  const s = await readSavedValues();
  return {
    pill: s["landing.pill"],
    hero1: s["landing.hero1"],
    hero2: s["landing.hero2"],
    hero3: s["landing.hero3"],
    lead: s["landing.lead"],
    ctaPrimary: s["landing.ctaPrimary"],
    ctaSecondary: s["landing.ctaSecondary"],
    muniBox: s["landing.muniBox"].split("\n").filter(Boolean),
    comodatoBox: s["landing.comodatoBox"].split("\n").filter(Boolean),
    showAccounts: s["demo.showAccounts"] !== "false",
    maintenance: s["demo.maintenance"] === "true",
    maintenanceMessage: s["demo.maintenanceMessage"],
    lockLogins: s["demo.lockLogins"] === "true",
    contactEmail: s["contact.email"],
    contactWhatsapp: s["contact.whatsapp"],
  };
}

export async function listGrants(): Promise<AccessGrant[]> {
  const s = await readSavedValues();
  try {
    const parsed = JSON.parse(s[GRANTS_KEY] || "[]") as AccessGrant[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeGrants(grants: AccessGrant[]): Promise<void> {
  await savePlatformValues({ [GRANTS_KEY]: JSON.stringify(grants) });
}

export async function revokedEmails(): Promise<Set<string>> {
  const s = await readSavedValues();
  return new Set(
    (s[REVOKED_KEY] || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function addRevokedEmail(email: string): Promise<void> {
  const set = await revokedEmails();
  set.add(email.toLowerCase());
  const grants = (await listGrants()).filter((g) => g.email !== email.toLowerCase());
  await savePlatformValues({
    [REVOKED_KEY]: [...set].join(","),
    [GRANTS_KEY]: JSON.stringify(grants),
  });
}

export async function clearRevokedEmail(email: string): Promise<void> {
  const set = await revokedEmails();
  set.delete(email.toLowerCase());
  await savePlatformValues({ [REVOKED_KEY]: [...set].join(",") });
}

export async function setFlash(text: string): Promise<void> {
  const jar = await cookies();
  jar.set(FLASH, encode({ t: text }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 120,
  });
}

export async function consumeFlash(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(FLASH)?.value;
  if (!raw) return null;
  jar.delete(FLASH);
  return decode(raw)?.t ?? null;
}

async function readJsonMap(key: string): Promise<Record<string, string>> {
  const s = await readSavedValues();
  try {
    const parsed = JSON.parse(s[key] || "{}") as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function displayNames(): Promise<Record<string, string>> {
  return readJsonMap(NAMES_KEY);
}

export async function passwordHashes(): Promise<Record<string, string>> {
  return readJsonMap(PASSHASH_KEY);
}

export function hashPassword(password: string): string {
  return createHmac("sha256", secret()).update(password).digest("base64url");
}

export function passwordMatchesHash(password: string, hash: string): boolean {
  const got = Buffer.from(hashPassword(password));
  const expected = Buffer.from(hash);
  if (got.length !== expected.length) return false;
  return timingSafeEqual(got, expected);
}

export async function setDisplayName(email: string, fullName: string): Promise<void> {
  const names = await displayNames();
  names[email.toLowerCase()] = fullName.trim();
  await savePlatformValues({ [NAMES_KEY]: JSON.stringify(names) });
}

export async function setPasswordHash(email: string, password: string): Promise<void> {
  const hashes = await passwordHashes();
  hashes[email.toLowerCase()] = hashPassword(password);
  await savePlatformValues({ [PASSHASH_KEY]: JSON.stringify(hashes) });
}

export async function hasCustomPassword(email: string): Promise<boolean> {
  const hashes = await passwordHashes();
  return Boolean(hashes[email.toLowerCase()]);
}
