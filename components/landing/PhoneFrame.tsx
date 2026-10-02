import Image from "next/image";

// Captura de la app dentro de un marco de móvil.
export default function PhoneFrame({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative aspect-[390/844] overflow-hidden rounded-[2.4rem] border-[7px] border-ink bg-ink shadow-2xl shadow-black/20 ${className}`}
    >
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 280px, 60vw" className="object-cover object-top" priority={priority} />
    </div>
  );
}
