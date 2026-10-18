import { NextResponse } from "next/server";
import { entrarSupabase } from "@/lib/medicion-servidor";

// Entrar en el panel (app/panel) con el email y la contraseña de la cuenta de KUOVA. Devuelve la
// sesión de Supabase (dura una hora); quién puede ver los datos lo decide la base de datos.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "faltan_datos" }, { status: 400 });

  const res = await entrarSupabase(email, password);
  if (!res) return NextResponse.json({ error: "sin_configurar" }, { status: 503 });
  if (!res.ok) return NextResponse.json({ error: "credenciales" }, { status: 401 });
  const s = await res.json();
  return NextResponse.json({ token: s.access_token, expira: s.expires_at, email: s.user?.email ?? email });
}
