"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-10">
      <p className="kicker">Tablero</p>
      <h1 className="mt-2 font-display text-3xl text-white">No se pudo completar</h1>
      <p className="mt-3 text-sm text-[var(--mute)]">
        El login de SmartTrafic vive en la sesión del navegador, no en las tablas del
        schema. Si estabas cambiando la clave, recarga e inténtalo otra vez: el
        tablero debe guardar igual aunque Auth de Supabase aún no tenga usuarios.
      </p>
      <div className="mt-6">
        <Button onClick={reset} type="button">
          Reintentar
        </Button>
      </div>
    </div>
  );
}
