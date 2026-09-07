import { approachScore } from "./algorithm";
import type {
  Alert,
  ApproachLive,
  AuditEvent,
  Counts,
  Device,
  HealthHeartbeat,
  HealthIssue,
  Intersection,
  Municipality,
  SessionUser,
  SystemVariable,
  Technician,
} from "./types";

const MUNI_ID = "11111111-1111-1111-1111-111111111111";

export const DEMO_USERS: Record<
  string,
  { password: string; user: SessionUser }
> = {
  "clpezci@gmail.com": {
    password: "Demo#SmartTrafic26",
    user: {
      id: "u-admin",
      email: "clpezci@gmail.com",
      fullName: "Cristian López",
      role: "superadmin",
      municipalityId: null,
      municipalityName: null,
      isPlatformAdmin: true,
    },
  },
  "alcalde@villaesperanza.gov.co": {
    password: "Demo#Municipio26",
    user: {
      id: "u-alcalde",
      email: "alcalde@villaesperanza.gov.co",
      fullName: "Secretaría de Tránsito",
      role: "municipality_admin",
      municipalityId: MUNI_ID,
      municipalityName: "Villa Esperanza",
      isPlatformAdmin: false,
    },
  },
  "tecnico@villaesperanza.gov.co": {
    password: "Demo#Tecnico26",
    user: {
      id: "u-tech",
      email: "tecnico@villaesperanza.gov.co",
      fullName: "Laura Méndez",
      role: "technician",
      municipalityId: MUNI_ID,
      municipalityName: "Villa Esperanza",
      isPlatformAdmin: false,
    },
  },
  "transito@villaesperanza.gov.co": {
    password: "Demo#Visor26",
    user: {
      id: "u-viewer",
      email: "transito@villaesperanza.gov.co",
      fullName: "Estación de Policía",
      role: "viewer",
      municipalityId: MUNI_ID,
      municipalityName: "Villa Esperanza",
      isPlatformAdmin: false,
    },
  },
};

function counts(partial: Partial<Counts>): Counts {
  return {
    m100: 0,
    m200: 0,
    m300: 0,
    waitS: 0,
    motos: 0,
    cars: 0,
    buses: 0,
    trucks: 0,
    peds: 0,
    emergency: false,
    ...partial,
  };
}

function live(
  id: string,
  name: string,
  heading: number,
  color: ApproachLive["color"],
  c: Counts,
  extras: Partial<ApproachLive> = {},
): ApproachLive {
  return {
    id,
    name,
    headingDeg: heading,
    color,
    greenElapsedS: extras.greenElapsedS ?? 14,
    pedWaiting: extras.pedWaiting ?? false,
    counts: c,
    score: approachScore(c, extras.color === "green" ? "normal" : "normal"),
    ...extras,
  };
}

export const municipalities: Municipality[] = [
  {
    id: MUNI_ID,
    name: "Villa Esperanza",
    department: "Cundinamarca",
    population: 42000,
    plan: "premium",
    monthlyFeeCop: 1_500_000,
    contractStart: "2026-07-01",
    contractEnd: "2027-06-30",
    active: true,
  },
  {
    id: "muni-2",
    name: "Puerto Cedro",
    department: "Meta",
    population: 18500,
    plan: "adaptativo",
    monthlyFeeCop: 1_200_000,
    contractStart: "2026-08-15",
    contractEnd: "2027-08-14",
    active: true,
  },
];

export const intersections: Intersection[] = [
  {
    id: "ix-1",
    municipalityId: MUNI_ID,
    code: "CR-01",
    name: "Parque Principal × Calle Real",
    geometry: "plus",
    lat: 4.7122,
    lng: -74.071,
    approaches: 4,
    plan: "premium",
    mode: "normal",
    online: true,
    healthScore: 98,
    solar: true,
    batteryPct: 87.5,
    firmwareVersion: "edge-0.9.1",
    lastHeartbeatAt: new Date(Date.now() - 8_000).toISOString(),
    live: [
      live("a", "Calle Real Norte", 0, "green", counts({ m100: 4, m200: 3, m300: 1, motos: 9, cars: 5, waitS: 8, peds: 1 })),
      live("b", "Parque Este", 90, "red", counts({ m100: 2, motos: 3, cars: 1, waitS: 22, peds: 4 }), { pedWaiting: true, greenElapsedS: 0 }),
      live("c", "Calle Real Sur", 180, "green", counts({ m100: 3, m200: 2, motos: 7, cars: 4, waitS: 6 })),
      live("d", "Parque Oeste", 270, "red", counts({ m100: 1, motos: 2, waitS: 18, peds: 2 }), { greenElapsedS: 0 }),
    ],
  },
  {
    id: "ix-2",
    municipalityId: MUNI_ID,
    code: "CR-02",
    name: "Colegio San José × Carrera 5",
    geometry: "t",
    lat: 4.7098,
    lng: -74.0742,
    approaches: 3,
    plan: "adaptativo",
    mode: "school",
    online: true,
    healthScore: 94,
    solar: true,
    batteryPct: 72,
    firmwareVersion: "edge-0.9.1",
    lastHeartbeatAt: new Date(Date.now() - 12_000).toISOString(),
    live: [
      live("a", "Carrera 5 Norte", 0, "red", counts({ m100: 6, m200: 4, motos: 5, cars: 8, buses: 1, waitS: 28 })),
      live("b", "Frente colegio", 90, "green", counts({ peds: 18, m100: 0, waitS: 4 }), { pedWaiting: true, greenElapsedS: 16 }),
      live("c", "Carrera 5 Sur", 180, "red", counts({ m100: 3, motos: 8, cars: 2, waitS: 19 })),
    ],
  },
  {
    id: "ix-3",
    municipalityId: MUNI_ID,
    code: "CR-03",
    name: "Entrada Sur — Variante",
    geometry: "plus",
    lat: 4.7011,
    lng: -74.0688,
    approaches: 4,
    plan: "adaptativo",
    mode: "normal",
    online: true,
    healthScore: 81,
    solar: true,
    batteryPct: 41,
    firmwareVersion: "edge-0.9.0",
    lastHeartbeatAt: new Date(Date.now() - 40_000).toISOString(),
    live: [
      live("a", "Variante entrada", 0, "green", counts({ m100: 8, m200: 6, m300: 4, trucks: 3, buses: 1, cars: 9, motos: 4, waitS: 11 })),
      live("b", "Calle 12 Este", 90, "red", counts({ m100: 1, motos: 2, waitS: 41 })),
      live("c", "Variante salida", 180, "green", counts({ m100: 5, m200: 2, cars: 6, motos: 3, waitS: 7 })),
      live("d", "Calle 12 Oeste", 270, "red", counts({ m100: 0, waitS: 9 })),
    ],
  },
  {
    id: "ix-4",
    municipalityId: MUNI_ID,
    code: "CR-04",
    name: "Hospital × Paso peatonal",
    geometry: "pedestrian",
    lat: 4.7135,
    lng: -74.0699,
    approaches: 2,
    plan: "premium",
    mode: "eco",
    online: false,
    healthScore: 54,
    solar: true,
    batteryPct: 18,
    firmwareVersion: "edge-0.8.4",
    lastHeartbeatAt: new Date(Date.now() - 16 * 60_000).toISOString(),
    live: [
      live("a", "Avenida Hospital", 90, "flashing_amber", counts({ m100: 2, cars: 2, waitS: 3 })),
      live("b", "Sentido contrario", 270, "flashing_amber", counts({ m100: 1, motos: 1, waitS: 2 })),
    ],
  },
];

export const technicians: Technician[] = [
  {
    id: "u-tech",
    fullName: "Laura Méndez",
    email: "tecnico@villaesperanza.gov.co",
    phone: "+57 310 555 0198",
    assigned: ["CR-01", "CR-02"],
    status: "disponible",
  },
  {
    id: "u-tech-2",
    fullName: "Andrés Pineda",
    email: "andres.pineda@villaesperanza.gov.co",
    phone: "+57 312 444 7710",
    assigned: ["CR-03", "CR-04"],
    status: "en_ruta",
  },
];

export const alerts: Alert[] = [
  {
    id: "al-1",
    intersectionId: "ix-4",
    severity: "critical",
    code: "BATTERY_LOW",
    title: "Hospital en modo Eco — batería 18%",
    body: "Tres días nublados. Se degradó el peatonal auxiliar. Revisar banco de baterías antes del anochecer.",
    acknowledged: false,
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: "al-2",
    intersectionId: "ix-4",
    severity: "warning",
    code: "HEARTBEAT_MISS",
    title: "Sin heartbeat hace 16 min",
    body: "El módem 4G no reporta. El edge sigue en local. Si pierde el monitor de conflicto, pasa a ámbar.",
    acknowledged: false,
    createdAt: new Date(Date.now() - 16 * 60_000).toISOString(),
  },
  {
    id: "al-3",
    intersectionId: "ix-3",
    severity: "info",
    code: "TRUCK_PEAK",
    title: "Cola de carga a 300 m en la variante",
    body: "4 camiones de 3+ ejes. El adaptativo extendió verde 18 s y evitó frenadas en pendiente.",
    acknowledged: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
  },
];

export const devices: Device[] = [
  { id: "d1", intersectionId: "ix-1", kind: "edge_brain", serial: "ST-BRN-0001", owner: "smarttrafic", label: "Cerebro CR-01" },
  { id: "d2", intersectionId: "ix-1", kind: "modem_4g", serial: "ST-MDM-0001", owner: "smarttrafic", label: "Módem 4G" },
  { id: "d3", intersectionId: "ix-1", kind: "camera_ai", serial: "ST-CAM-0001", owner: "smarttrafic", label: "Cámara IA Norte" },
  { id: "d4", intersectionId: "ix-1", kind: "esp32_satellite", serial: "ST-ESP-0004", owner: "smarttrafic", label: "Satélite Oeste" },
  { id: "d5", intersectionId: "ix-1", kind: "floor_led", serial: "MUN-FLR-01", owner: "municipality", label: "Barra de piso peatonal" },
  { id: "d6", intersectionId: "ix-1", kind: "acoustic", serial: "MUN-AUD-01", owner: "municipality", label: "Audio invidentes" },
  { id: "d7", intersectionId: "ix-1", kind: "solar_controller", serial: "MUN-SOL-01", owner: "municipality", label: "Regulador solar (poste)" },
];

export const auditEvents: AuditEvent[] = [
  { id: "au-1", actorEmail: "clpezci@gmail.com", action: "platform.bootstrap", entity: "system", createdAt: new Date(Date.now() - 86400000).toISOString(), diff: "Fase 1 en línea" },
  { id: "au-2", actorEmail: "alcalde@villaesperanza.gov.co", action: "timing.update", entity: "CR-02", createdAt: new Date(Date.now() - 3600000).toISOString(), diff: "min_ped_s 12 → 16 (modo colegio)" },
  { id: "au-3", actorEmail: "tecnico@villaesperanza.gov.co", action: "alert.ack", entity: "TRUCK_PEAK", createdAt: new Date(Date.now() - 7200000).toISOString() },
];

export const healthIssues: HealthIssue[] = [
  { id: "h1", source: "edge.CR-04", level: "warning", message: "Heartbeat retrasado 16 min", count: 3, lastSeenAt: new Date().toISOString() },
  { id: "h2", source: "solar.CR-04", level: "error", message: "Batería bajo umbral eco (20%)", count: 1, lastSeenAt: new Date().toISOString() },
  { id: "h3", source: "api.ingest", level: "info", message: "Cola MQTT vacía — broker aún no provisionado", count: 1, lastSeenAt: new Date().toISOString() },
];

export const heartbeats: HealthHeartbeat[] = [
  { component: "Aplicación", ok: true, latencyMs: 18, detail: "Vercel / Next.js" },
  { component: "Base de datos", ok: true, latencyMs: 42, detail: "Supabase (o demo local)" },
  { component: "Telegram", ok: Boolean(process.env.TELEGRAM_BOT_TOKEN), latencyMs: 120, detail: process.env.TELEGRAM_BOT_TOKEN ? "Bot listo" : "Falta token" },
  { component: "MQTT", ok: false, latencyMs: 0, detail: "Pendiente HiveMQ" },
  { component: "Ingesta", ok: true, latencyMs: 9, detail: "/api/ingest HMAC" },
];

export const platformVariables: SystemVariable[] = [
  { key: "telegram.enabled", label: "Alertas Telegram", value: "true", scope: "platform", group: "Canales", hint: "Reportes de salud al chat del superadmin" },
  { key: "health.reportHour", label: "Hora del reporte diario", value: "07:00", scope: "platform", group: "Canales", hint: "America/Bogota" },
  { key: "ingest.requireHmac", label: "Firmar telemetría", value: "true", scope: "platform", group: "Seguridad", hint: "Rechaza paquetes de campo sin HMAC" },
  { key: "feature.motoFirst", label: "Peso extra para motos", value: "true", scope: "platform", group: "Algoritmo", hint: "Cola motos no se trata como autos" },
  { key: "feature.nightAntiCrime", label: "Noche antiatraco", value: "true", scope: "platform", group: "Algoritmo", hint: "Verde anticipado si la otra calle está vacía" },
  { key: "feature.solarEco", label: "Modo Eco solar", value: "true", scope: "platform", group: "Energía", hint: "Degrada auxiliares bajo 20% de batería" },
  { key: "feature.emergencyPreempt", label: "Prioridad emergencia", value: "true", scope: "platform", group: "Algoritmo", hint: "Sirena / app / visión" },
];

export const municipalityVariables: SystemVariable[] = [
  { key: "min_green_s", label: "Verde mínimo (s)", value: "8", scope: "municipality", group: "Tiempos", hint: "Nunca por debajo. Seguridad de cruce." },
  { key: "max_green_s", label: "Verde máximo (s)", value: "60", scope: "municipality", group: "Tiempos", hint: "Tope aunque la cola siga creciendo." },
  { key: "yellow_s", label: "Ámbar (s)", value: "3", scope: "municipality", group: "Tiempos", hint: "Despeje. El algoritmo no lo toca." },
  { key: "all_red_s", label: "Todo rojo (s)", value: "1", scope: "municipality", group: "Tiempos", hint: "Limpieza del cajón." },
  { key: "min_ped_s", label: "Peatonal mínimo (s)", value: "12", scope: "municipality", group: "Tiempos", hint: "Inviolable si hay botón o detección." },
  { key: "bands", label: "Bandas de sensor (m)", value: "100, 200, 300", scope: "municipality", group: "Detección", hint: "Zonas virtuales o radar." },
  { key: "school_windows", label: "Ventanas colegio", value: "06:50–07:40 y 12:20–13:30", scope: "municipality", group: "Modos", hint: "Verde peatonal largo automático." },
  { key: "night_window", label: "Ventana noche segura", value: "23:00–05:00", scope: "municipality", group: "Modos", hint: "No detener si la otra vía está vacía." },
];

export const kpis = {
  waitDropPct: 28,
  fuelSavedGal: 186,
  co2Tons: 1.7,
  motosClassified: 12840,
  trucks3axle: 412,
  uptimePct: 99.2,
  openAlerts: 2,
  intersectionsOnline: 3,
  intersectionsTotal: 4,
};
