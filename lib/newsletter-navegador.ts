// Recuerda en este navegador que la persona ya se apuntó a Kuova Letter, para no volver a pedírselo
// (formulario de las guías y casilla de la lista de espera). Solo guarda el estado y la fecha, nunca
// el email. «pendiente» (pidió el alta y falta confirmar el email) deja de contar a los 3 días, por si
// no llegó a confirmar; «suscrito» (pasó por /newsletter/confirmada) se queda.
const CLAVE = "kuova-newsletter";
const DIAS_PENDIENTE = 3;

export function recordarNewsletter(estado: "pendiente" | "suscrito") {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ estado, fecha: Date.now() }));
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): se volverá a ofrecer, sin más
  }
}

export function yaApuntado(): boolean {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    if (v?.estado === "suscrito") return true;
    return v?.estado === "pendiente" && Date.now() - v.fecha < DIAS_PENDIENTE * 86_400_000;
  } catch {
    return false;
  }
}
