import type { Metadata } from "next";
import { PitchDeck } from "@/components/pitch-deck";
import { getLandingCopy } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Piloto · SmartTrafic",
  description:
    "Propuesta de piloto para semaforización solar y adaptativa. El acero es del municipio. El cerebro se prueba juntos.",
};

export default async function PilotoPage() {
  const copy = await getLandingCopy();
  return <PitchDeck email={copy.contactEmail} whatsapp={copy.contactWhatsapp} />;
}
