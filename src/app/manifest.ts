import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SmartTrafic",
    short_name: "SmartTrafic",
    description:
      "Tablero de semaforización solar y adaptativa para municipios. Indicadores, cruces y alertas en el bolsillo.",
    start_url: "/app/tablero",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#07060a",
    theme_color: "#07060a",
    lang: "es-CO",
    dir: "ltr",
    categories: ["utilities", "navigation", "government"],
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/512?maskable=1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Tablero",
        short_name: "Tablero",
        url: "/app/tablero",
      },
      {
        name: "En vivo",
        short_name: "En vivo",
        url: "/app/en-vivo",
      },
      {
        name: "Alertas",
        short_name: "Alertas",
        url: "/app/alertas",
      },
    ],
  };
}
