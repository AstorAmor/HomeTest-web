"use client";

import { useEffect } from "react";
import { recordarNewsletter } from "@/lib/newsletter-navegador";

// En /newsletter/confirmada: este navegador ya está suscrito, así que las guías dejan de pedirlo.
export default function RecordarSuscripcion() {
  useEffect(() => recordarNewsletter("suscrito"), []);
  return null;
}
