import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Cpu,
  Gauge,
  Map,
  Radio,
  Settings2,
  Shield,
  User,
  Users,
  Wrench,
} from "lucide-react";

export const APP_NAV = [
  { href: "/app/tablero", label: "Tablero", icon: BarChart3 },
  { href: "/app/en-vivo", label: "En vivo", icon: Radio },
  { href: "/app/cruces", label: "Cruces", icon: Map },
  { href: "/app/alertas", label: "Alertas", icon: Bell },
  { href: "/app/tecnicos", label: "Técnicos", icon: Wrench },
  { href: "/app/alcaldias", label: "Alcaldías", icon: Building2 },
  { href: "/app/activos", label: "Activos", icon: Cpu },
  { href: "/app/simulador", label: "Simulador", icon: Gauge },
  { href: "/app/reportes", label: "Reportes", icon: Activity },
  { href: "/app/cuenta", label: "Cuenta", icon: User },
  { href: "/app/configuracion", label: "Variables", icon: Settings2 },
] as const;

export const MOBILE_TABS = APP_NAV.slice(0, 4);

export const PLATFORM_NAV = [
  { href: "/app/plataforma/salud", label: "Salud del sistema", icon: Shield },
  { href: "/app/plataforma/auditoria", label: "Auditoría", icon: Users },
  { href: "/app/plataforma/variables", label: "Admin", icon: Settings2 },
] as const;
