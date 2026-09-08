export const SUPERADMIN_EMAIL = (
  process.env.SUPERADMIN_EMAIL || "clpezci@gmail.com"
).toLowerCase();

export const PRODUCT = {
  name: "SmartTrafic",
  tagline: "El sistema operativo de movilidad del municipio",
  legal: "Tecnología en comodato. Postes y ópticas del municipio.",
};

export type Role =
  | "superadmin"
  | "platform_ops"
  | "municipality_admin"
  | "technician"
  | "viewer";

export type PlanTier = "esencial" | "adaptativo" | "premium";
export type Geometry = "t" | "plus" | "pedestrian";
export type Mode =
  | "normal"
  | "school"
  | "market"
  | "night"
  | "eco"
  | "emergency"
  | "failsafe";
export type LightColor = "red" | "amber" | "green" | "flashing_amber" | "off";
export type AssetOwner = "municipality" | "smarttrafic";
export type AlertSeverity = "info" | "warning" | "critical";
export type DeviceKind =
  | "edge_brain"
  | "esp32_satellite"
  | "relay_board"
  | "modem_4g"
  | "camera_ai"
  | "radar"
  | "solar_controller"
  | "ped_button"
  | "floor_led"
  | "acoustic";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  municipalityId: string | null;
  municipalityName: string | null;
  isPlatformAdmin: boolean;
  grantExpiresAt?: string | null;
  isGuest?: boolean;
};

export type Counts = {
  m100: number;
  m200: number;
  m300: number;
  waitS: number;
  motos: number;
  cars: number;
  buses: number;
  trucks: number;
  peds: number;
  emergency: boolean;
};

export type ApproachLive = {
  id: string;
  name: string;
  headingDeg: number;
  color: LightColor;
  greenElapsedS: number;
  pedWaiting: boolean;
  counts: Counts;
  score: number;
};

export type Intersection = {
  id: string;
  municipalityId: string;
  code: string;
  name: string;
  geometry: Geometry;
  lat: number;
  lng: number;
  approaches: number;
  plan: PlanTier;
  mode: Mode;
  online: boolean;
  healthScore: number;
  solar: boolean;
  batteryPct: number;
  firmwareVersion: string;
  lastHeartbeatAt: string;
  live: ApproachLive[];
};

export type Municipality = {
  id: string;
  name: string;
  department: string;
  population: number;
  plan: PlanTier;
  monthlyFeeCop: number;
  contractStart: string;
  contractEnd: string;
  active: boolean;
};

export type Technician = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  assigned: string[];
  status: "disponible" | "en_ruta" | "en_sitio";
};

export type Alert = {
  id: string;
  intersectionId: string | null;
  severity: AlertSeverity;
  code: string;
  title: string;
  body: string;
  acknowledged: boolean;
  createdAt: string;
};

export type Device = {
  id: string;
  intersectionId: string;
  kind: DeviceKind;
  serial: string;
  owner: AssetOwner;
  label: string;
};

export type AuditEvent = {
  id: string;
  actorEmail: string;
  action: string;
  entity: string;
  createdAt: string;
  diff?: string;
};

export type HealthIssue = {
  id: string;
  source: string;
  level: "info" | "warning" | "error" | "fatal";
  message: string;
  count: number;
  lastSeenAt: string;
};

export type HealthHeartbeat = {
  component: string;
  ok: boolean;
  latencyMs: number;
  detail: string;
};

export type TimingProfile = {
  minGreenS: number;
  maxGreenS: number;
  yellowS: number;
  allRedS: number;
  minPedS: number;
  extensionS: number;
};

export type SystemVariable = {
  key: string;
  label: string;
  value: string;
  scope: "platform" | "municipality";
  group: string;
  hint: string;
};
