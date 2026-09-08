export type BiPeriod = "hoy" | "7d" | "30d";
export type BiScope = "villa" | "cedro" | "red";

export const biKpis = {
  hoy: {
    online: "5 / 6",
    onlineDelta: "−1 eco",
    uptime: "99.2%",
    uptimeDelta: "+0.4 pp",
    wait: "−28%",
    waitDelta: "vs ciclo 45 s",
    motos: "412",
    motosDelta: "+18% vs ayer",
    fuel: "6.2 gal",
    fuelDelta: "ralentí evitado vs 45 s",
    co2: "0.06 t",
    co2Delta: "hoy",
    alerts: "2",
    alertsDelta: "1 crítica",
    battery: "54%",
    batteryDelta: "mín. CR-04",
    preempt: "3",
    preemptDelta: "ambulancias",
    night: "11",
    nightDelta: "verdes anticipados",
  },
  "7d": {
    online: "5.7 / 6",
    onlineDelta: "media 7 d",
    uptime: "99.1%",
    uptimeDelta: "+0.2 pp",
    wait: "−31%",
    waitDelta: "vs ciclo fijo",
    motos: "3 184",
    motosDelta: "+12% vs sem. ant.",
    fuel: "48 gal",
    fuelDelta: "ralentí evitado · 7 d",
    co2: "0.44 t",
    co2Delta: "7 días",
    alerts: "5",
    alertsDelta: "2 abiertas",
    battery: "61%",
    batteryDelta: "media red",
    preempt: "14",
    preemptDelta: "emergencias",
    night: "62",
    nightDelta: "noche segura",
  },
  "30d": {
    online: "5.8 / 6",
    onlineDelta: "media mes",
    uptime: "99.2%",
    uptimeDelta: "SLA 99%",
    wait: "−28%",
    waitDelta: "vs ciclo 45 s",
    motos: "12 840",
    motosDelta: "+9% vs mes ant.",
    fuel: "186 gal",
    fuelDelta: "ralentí evitado · mes",
    co2: "1.7 t",
    co2Delta: "mes",
    alerts: "11",
    alertsDelta: "2 abiertas",
    battery: "64%",
    batteryDelta: "media mes",
    preempt: "41",
    preemptDelta: "emergencias",
    night: "218",
    nightDelta: "noche segura",
  },
};

export const hourlyFlow = [
  { h: "00", motos: 8, autos: 3, pesados: 0 },
  { h: "01", motos: 4, autos: 1, pesados: 0 },
  { h: "02", motos: 3, autos: 1, pesados: 1 },
  { h: "03", motos: 2, autos: 0, pesados: 2 },
  { h: "04", motos: 6, autos: 2, pesados: 3 },
  { h: "05", motos: 28, autos: 9, pesados: 4 },
  { h: "06", motos: 74, autos: 22, pesados: 6 },
  { h: "07", motos: 118, autos: 41, pesados: 8 },
  { h: "08", motos: 96, autos: 38, pesados: 7 },
  { h: "09", motos: 61, autos: 24, pesados: 9 },
  { h: "10", motos: 48, autos: 19, pesados: 11 },
  { h: "11", motos: 52, autos: 21, pesados: 10 },
  { h: "12", motos: 88, autos: 27, pesados: 6 },
  { h: "13", motos: 79, autos: 25, pesados: 5 },
  { h: "14", motos: 54, autos: 20, pesados: 8 },
  { h: "15", motos: 57, autos: 22, pesados: 9 },
  { h: "16", motos: 71, autos: 29, pesados: 8 },
  { h: "17", motos: 109, autos: 44, pesados: 7 },
  { h: "18", motos: 121, autos: 39, pesados: 4 },
  { h: "19", motos: 86, autos: 28, pesados: 3 },
  { h: "20", motos: 49, autos: 16, pesados: 2 },
  { h: "21", motos: 31, autos: 11, pesados: 1 },
  { h: "22", motos: 18, autos: 6, pesados: 1 },
  { h: "23", motos: 11, autos: 4, pesados: 0 },
];

export const waitByCrossing = [
  { cruce: "CR-01 Parque C.", adaptativo: 18, fijo: 45, motos: 62 },
  { cruce: "CR-02 Ospina", adaptativo: 22, fijo: 45, motos: 48 },
  { cruce: "CR-03 Estadio", adaptativo: 19, fijo: 45, motos: 41 },
  { cruce: "CR-04 Cement.", adaptativo: 29, fijo: 45, motos: 22 },
  { cruce: "CR-05 Circunv.", adaptativo: 16, fijo: 45, motos: 31 },
  { cruce: "CR-06 S. Fern.", adaptativo: 17, fijo: 45, motos: 36 },
];

export const batteryWeek = [
  { d: "Mar 2", cr01: 91, cr02: 78, cr03: 70, cr04: 41, cr05: 55, cr06: 82 },
  { d: "Mar 3", cr01: 88, cr02: 74, cr03: 68, cr04: 33, cr05: 49, cr06: 80 },
  { d: "Mar 4", cr01: 84, cr02: 71, cr03: 66, cr04: 26, cr05: 44, cr06: 78 },
  { d: "Mar 5", cr01: 90, cr02: 76, cr03: 69, cr04: 22, cr05: 52, cr06: 81 },
  { d: "Mar 6", cr01: 93, cr02: 80, cr03: 71, cr04: 19, cr05: 58, cr06: 83 },
  { d: "Mar 7", cr01: 89, cr02: 75, cr03: 67, cr04: 18, cr05: 46, cr06: 79 },
  { d: "Hoy", cr01: 87, cr02: 72, cr03: 64, cr04: 18, cr05: 41, cr06: 76 },
];

export const modalShare = [
  { name: "Motos", value: 61, fill: "#2ef28a" },
  { name: "Autos", value: 24, fill: "#7cb8ff" },
  { name: "Buses", value: 5, fill: "#ffbf24" },
  { name: "Camiones", value: 6, fill: "#ff8a4c" },
  { name: "Peatones", value: 4, fill: "#c4b5fd" },
];

export const heatHours = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
export const heatRows = [
  { cruce: "CR-01", vals: [0.4, 0.9, 0.7, 0.5, 0.3, 0.3, 0.6, 0.5, 0.4, 0.4, 0.6, 0.85, 0.95, 0.6, 0.3] },
  { cruce: "CR-02", vals: [0.5, 1, 0.6, 0.35, 0.25, 0.3, 0.8, 0.55, 0.3, 0.35, 0.5, 0.7, 0.75, 0.45, 0.2] },
  { cruce: "CR-03", vals: [0.3, 0.55, 0.5, 0.4, 0.35, 0.35, 0.45, 0.4, 0.4, 0.5, 0.55, 0.75, 0.85, 0.5, 0.25] },
  { cruce: "CR-04", vals: [0.2, 0.35, 0.3, 0.25, 0.3, 0.4, 0.35, 0.3, 0.35, 0.4, 0.35, 0.45, 0.4, 0.3, 0.2] },
  { cruce: "CR-05", vals: [0.35, 0.7, 0.65, 0.55, 0.6, 0.55, 0.5, 0.45, 0.5, 0.55, 0.6, 0.8, 0.7, 0.4, 0.25] },
  { cruce: "CR-06", vals: [0.25, 0.5, 0.45, 0.35, 0.3, 0.3, 0.4, 0.4, 0.35, 0.35, 0.45, 0.6, 0.55, 0.35, 0.2] },
];

export const matrix = [
  { code: "CR-01", name: "Parque Central", wait: 18, health: 98, bat: 87, motos: 184, status: "ok", mode: "Adaptativo" },
  { code: "CR-02", name: "Ospina", wait: 22, health: 94, bat: 72, motos: 141, status: "ok", mode: "Colegio" },
  { code: "CR-03", name: "Estadio", wait: 19, health: 88, bat: 64, motos: 118, status: "ok", mode: "Adaptativo" },
  { code: "CR-04", name: "Cementerio", wait: 29, health: 54, bat: 18, motos: 38, status: "eco", mode: "Eco solar" },
  { code: "CR-05", name: "Circunvalar", wait: 16, health: 81, bat: 41, motos: 96, status: "ok", mode: "Adaptativo" },
  { code: "CR-06", name: "San Fernando", wait: 17, health: 91, bat: 76, motos: 102, status: "ok", mode: "Noche segura" },
];

export const savingsMonth = [
  { mes: "Abr", cop: 4.1 },
  { mes: "May", cop: 5.4 },
  { mes: "Jun", cop: 6.0 },
  { mes: "Jul", cop: 6.8 },
  { mes: "Ago", cop: 7.2 },
  { mes: "Sep", cop: 7.9 },
];

export const modeHours = [
  { modo: "Adaptativo", h: 14.2 },
  { modo: "Colegio", h: 3.1 },
  { modo: "Noche segura", h: 5.4 },
  { modo: "Eco", h: 1.3 },
];

export const sparks = {
  wait: [42, 39, 36, 34, 31, 29, 28],
  motos: [210, 240, 255, 268, 290, 340, 412],
  bat: [72, 68, 61, 55, 52, 50, 54],
  alerts: [1, 0, 2, 1, 3, 2, 2],
  uptime: [98.6, 99.0, 99.1, 98.9, 99.3, 99.2, 99.2],
  fuel: [4.1, 4.8, 5.2, 5.6, 5.9, 6.0, 6.2],
};

export const scopeLabel: Record<BiScope, string> = {
  villa: "El Carmen de Viboral · 6 cruces",
  cedro: "El Cedro · 2 cruces demo",
  red: "Red piloto · 6 alcaldías",
};

export const insights = [
  { tone: "stop" as const, text: "CR-04 Cementerio: 18% batería · 16 min sin heartbeat" },
  { tone: "wait" as const, text: "Pico 18:00 — 164 vehículos, 74% motos" },
  { tone: "go" as const, text: "Espera −28% vs ciclo fijo 45 s · 6.2 gal de gas no quemado (ralentí)" },
];

export const alertFeed = [
  { sev: "crítica", cruce: "CR-04", title: "Eco solar · batería 18%", ago: "hace 18 min" },
  { sev: "aviso", cruce: "CR-04", title: "Heartbeat perdido 16 min", ago: "hace 16 min" },
  { sev: "info", cruce: "CR-05", title: "Cola de carga 3+ ejes · Circunvalar", ago: "hace 2 h" },
  { sev: "ok", cruce: "CR-02", title: "Modo colegio activo 06:50 · Ospina", ago: "hoy" },
];
