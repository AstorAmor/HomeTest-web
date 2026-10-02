// Cinta horizontal infinita (se para al pasar el ratón y con "menos movimiento").
// La segunda copia es solo visual: los lectores de pantalla leen la lista una vez.
export default function Marquee({
  items,
  duration = 60,
  reverse = false,
  itemClassName = "",
}: {
  items: string[];
  duration?: number;
  reverse?: boolean;
  itemClassName?: string;
}) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {items.map((item) => (
        <li key={item} className={`whitespace-nowrap ${itemClassName}`}>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="marquee-track flex w-max"
        style={{ ["--marquee-duration" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : undefined }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
