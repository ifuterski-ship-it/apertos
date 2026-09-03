import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Abel \"The Ninja\" Biju | Apertos Fightwear Sponsored Athlete",
  description:
    "Abel \"The Ninja\" Biju is an Apertos Fightwear sponsored amateur MMA fighter representing Lions Gym Coventry. An exciting UK amateur MMA prospect with an 8-1-0 record.",
  robots: { index: true, follow: true }
};

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com/abelbiju_06",
    handle: "@abelbiju_06"
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@abelbiju_06",
    handle: "@abelbiju_06"
  }
];

const stats = [
  { label: "Record", value: "8–1–0" },
  { label: "Nickname", value: "The Ninja" },
  { label: "Gym", value: "Lions Gym Coventry" },
  { label: "Fighting Out Of", value: "Coventry, UK" }
];

export default function AbelBijuPage() {
  return (
    <div className="space-y-16 pb-24">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">
          <Image
            src="/fighters/abel-biju.jpg"
            alt='Abel "The Ninja" Biju'
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-top"
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-crimson">Apertos Sponsored Athlete</p>
            <h1 className="font-display text-4xl uppercase tracking-[0.06em] md:text-6xl">
              Abel <span className="text-crimson">“The Ninja”</span> Biju
            </h1>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Lions Gym Coventry</p>
          </div>

          <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-panel p-7">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between gap-4 border-b border-white/5 py-2 last:border-0">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">{stat.label}</span>
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-white">{stat.value}</span>
              </div>
            ))}
          </div>

          <p className="max-w-xl text-sm uppercase leading-7 tracking-[0.2em] text-neutral-300">
            Abel “The Ninja” Biju is an exciting amateur MMA fighter representing
            <span className="text-white"> Lions Gym Coventry</span>. Known for his aggressive style and submission
            ability, Abel is one of the rising fighters on the UK amateur MMA scene.
          </p>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.45em] text-neutral-400">Follow Abel</p>
            <div className="flex flex-wrap gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.3em] transition hover:border-white hover:text-white"
                >
                  {social.label} {social.handle}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-crimson/30 bg-crimson/5 p-7">
            <p className="text-xs uppercase tracking-[0.4em] text-crimson">Apertos × Abel Biju</p>
            <p className="mt-3 font-display text-2xl uppercase tracking-[0.1em] text-white">Engineered for Dominance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
