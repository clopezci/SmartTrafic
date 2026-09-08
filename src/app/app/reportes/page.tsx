import { Bento, Kicker, Pill } from "@/components/ui";
import { DEMO_MUNICIPALITY_NAME, kpis } from "@/lib/demo-data";

export default function ReportesPage() {
  return (
    <div className="space-y-5">
      <div>
        <Kicker>Despacho del alcalde</Kicker>
        <h1 className="font-display text-4xl text-white">Reporte del mes</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          En producción esto lo redacta un modelo de lenguaje con los datos reales y se va por correo. Aquí está el contenido, ya en lenguaje de gobierno.
        </p>
      </div>
      <Bento glow="green">
        <div className="flex flex-wrap gap-2">
          <Pill tone="green">{DEMO_MUNICIPALITY_NAME}</Pill>
          <Pill>septiembre 2026</Pill>
          <Pill tone="blue">borrador automático</Pill>
        </div>
        <div className="prose-report mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-white/80">
          <p>
            Señor Alcalde: en las últimas cuatro semanas el sistema adaptativo de
            seis cruces redujo la espera media un {kpis.waitDropPct}% frente a un
            ciclo fijo de 45 segundos. Eso equivale, en la cuenta conservadora del
            laboratorio, a {kpis.fuelSavedGal} galones de gasolina que no se
            quemaron en ralentí (motores parados en el semáforo) y {kpis.co2Tons}{" "}
            toneladas de CO₂ evitadas. No es el tanque solar del poste: es el
            combustible que los vehículos dejaron de gastar por no esperar de más.
          </p>
          <p>
            El cruce de Ospina operó en modo colegio en las ventanas de
            6:50–7:40 y 12:20–13:30. El peatonal mínimo se respetó siempre. En
            Circunvalar el algoritmo detectó {kpis.trucks3axle} pasos de camiones de
            tres o más ejes: es el número que Hacienda puede usar para hablar de
            desgaste de vía y de una eventual variante.
          </p>
          <p>
            Cementerio está en modo Eco (batería al 18% tras tres días nublados).
            El cruce no se apagó: degradó auxiliares y pasó a ámbar seguro cuando
            perdió el heartbeat. Recomendación: revisar el banco de baterías esta
            semana, no esperar a que el concejo se entere por Facebook.
          </p>
          <p>
            Motos clasificadas en el mes: {kpis.motosClassified.toLocaleString("es-CO")}.
            El peso de cola no las trata como carros. Eso es la diferencia con SCATS
            en un municipio colombiano.
          </p>
        </div>
      </Bento>
      <div className="grid gap-4 md:grid-cols-3">
        <Bento>
          <Kicker>Uptime</Kicker>
          <p className="mt-2 font-display text-4xl text-white">{kpis.uptimePct}%</p>
        </Bento>
        <Bento>
          <Kicker>Motos vistas</Kicker>
          <p className="mt-2 font-display text-4xl text-white">
            {kpis.motosClassified.toLocaleString("es-CO")}
          </p>
        </Bento>
        <Bento>
          <Kicker>CO₂ evitado</Kicker>
          <p className="mt-2 font-display text-4xl text-[var(--go)]">{kpis.co2Tons} t</p>
        </Bento>
      </div>
    </div>
  );
}
