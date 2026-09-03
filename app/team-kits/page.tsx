import { TeamKitForm } from "@/app/team-kits/team-kit-form";
import { SectionHeading } from "@/components/ui/section-heading";

const kitProducts = [
  {
    name: "Rash Guards",
    description: "Compression-style BJJ rash guards built for no-gi training, with your club colours, logo and name."
  },
  {
    name: "Hoodies",
    description: "Heavyweight club hoodies for warm-ups, travel and everyday wear around the gym."
  },
  {
    name: "MMA Shorts",
    description: "Lightweight grappling shorts made for movement and sparring, fully customised to your club."
  }
];

const steps = [
  {
    title: "Tell Us What You Need",
    description: "Send over how many of each piece your club wants and we'll handle the rest."
  },
  {
    title: "We Design Together, Side By Side",
    description:
      "We work with you every step of the way on colours, placement and layout until the kit is perfect in your mind."
  },
  {
    title: "Produce & Ship",
    description: "Your kit goes into production and is ready to receive in around 6 weeks from sign off."
  }
];

export default function TeamKitsPage() {
  return (
    <div className="space-y-20 pb-24">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Custom</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Team &amp; Club Kits</h1>
        <p className="mx-auto max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Build a custom kit for your team, club or academy — rash guards, hoodies and MMA shorts designed with you,
          made for you.
        </p>
      </div>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Kit Options"
          title="What We Make"
          description="Choose any combination of pieces for your full club kit."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {kitProducts.map((product) => (
            <div
              key={product.name}
              className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-luxe"
            >
              <p className="font-display text-2xl uppercase tracking-[0.08em]">{product.name}</p>
              <p className="text-sm leading-7 text-neutral-300">{product.description}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">Min. order: 10 each</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="How It Works"
          title="Design & Production"
          description="From first message to delivery, here's how we build your kit."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="space-y-3 rounded-[2rem] border border-white/10 p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">Step {index + 1}</p>
              <p className="font-display text-xl uppercase tracking-[0.06em]">{step.title}</p>
              <p className="text-sm leading-7 text-neutral-300">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center space-y-3">
          <p className="font-display text-xl uppercase tracking-[0.06em]">Lead Time</p>
          <p className="mx-auto max-w-xl text-sm leading-7 text-neutral-300">
            Around <span className="text-white">6 weeks</span> from design sign-off to receiving your kit. We work side
            by side with you on colours, placement and layout until every detail is perfect in your mind.
          </p>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Get a Price"
          title="Start Your Kit"
          description="Tell us how many of each piece you need and we'll come back to you with a price."
        />
        <div className="mx-auto max-w-3xl">
          <TeamKitForm />
        </div>
      </section>
    </div>
  );
}
