type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs uppercase tracking-[0.45em] text-muted">{eyebrow}</p>
      <h2 className="font-display text-3xl uppercase tracking-[0.08em] md:text-5xl">{title}</h2>
      <p className="text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300 md:text-base">{description}</p>
    </div>
  );
}
