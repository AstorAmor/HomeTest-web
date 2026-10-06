import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  href: string;
  children: ReactNode;
  // "cream": botón principal sobre foto o fondo oscuro (el verde se perdería)
  variant?: "primary" | "secondary" | "light" | "cream";
  className?: string;
}

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-accent text-on-accent hover:bg-accent-hover"
      : variant === "cream"
        ? "bg-bg text-accent hover:bg-bg-soft"
        : variant === "light"
        ? "border border-white/50 text-white backdrop-blur hover:bg-white/10"
        : "border border-border text-text hover:bg-surface";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
