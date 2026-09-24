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
        <div className="max-w-2xl py-14 sm:py-20">
          <h1 className="text-balance text-3xl font-bold text-text sm:text-5xl">
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
