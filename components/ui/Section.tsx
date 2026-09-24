import { ReactNode } from "react";
import Container from "./Container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  soft?: boolean;
  id?: string;
}

// Envoltorio de sección con espaciado vertical consistente en toda la web.
export default function Section({ children, className = "", soft = false, id }: SectionProps) {
  return (
    <section id={id} className={`${soft ? "bg-bg-soft" : ""} py-16 sm:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}
