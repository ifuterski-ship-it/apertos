import { ContactForm } from "@/app/contact/contact-form";

export default function ContactPage() {
  return (
    <div className="space-y-8 pb-24">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-muted">Contact</p>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-6xl">Speak To Apertos</h1>
        <p className="mx-auto max-w-2xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
          Questions about stock, fit, collaborations, or orders can come straight through here.
        </p>
      </div>
      <div className="mx-auto max-w-3xl">
        <ContactForm />
      </div>
    </div>
  );
}
