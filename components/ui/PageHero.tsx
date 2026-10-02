import Container from "./Container";

export default function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-border bg-bg-soft">
      <Container>
        <div className="max-w-2xl pb-14 pt-32 sm:pb-20 sm:pt-40">
          <h1 className="text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-balance text-lg text-text-muted">{subtitle}</p>
          )}
        </div>
      </Container>
    </section>
  );
}
