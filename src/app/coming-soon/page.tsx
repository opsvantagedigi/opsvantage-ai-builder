import Link from "next/link";
import { CalendarClock, CheckCircle2, Rocket } from "lucide-react";
import { WaitlistViralCard } from "@/components/marketing/WaitlistViralCard";

const launchDate = "March 13, 2026";

const milestones = [
  "Core AI generation workflows validated",
  "Cloud Run deployment path hardened",
  "Domain and SSL automation in final QA",
  "Production onboarding experience under review",
];

const intrigueOptions = [
  {
    headline: "Something New Is Coming for Founders Who Refuse the Status Quo",
    description:
      "A new kind of digital power is about to shift hands. Not an agency. Not a builder. Not another tool. Something different — designed for founders who want control without complexity.",
  },
  {
    headline: "A Different Operating Layer Is About to Open",
    description:
      "The next phase is not louder software. It is quieter leverage. Built for founders who need velocity, ownership, and execution without surrendering control.",
  },
];

const INTRIGUE_ROTATION_START_UTC = Date.UTC(2026, 1, 15);
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

function getIntrigueIndex() {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const elapsed = Math.max(0, todayUtc - INTRIGUE_ROTATION_START_UTC);
  const index = Math.floor(elapsed / TWO_DAYS_MS) % intrigueOptions.length;
  return index;
}

export default function ComingSoonPage() {
  const activeIntrigue = intrigueOptions[getIntrigueIndex()];

  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="mb-8">
          <WaitlistViralCard />
        </div>
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Launch Update</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gradient-sovereign animate-fade-in md:text-5xl">
            {activeIntrigue.headline}
          </h1>
          <p className="mt-5 max-w-3xl animate-fade-in text-base leading-7 text-slate-600 dark:text-slate-300">
            {activeIntrigue.description}
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-200">
            <CalendarClock className="h-4 w-4" />
            Target release: {launchDate}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="button-primary">
              Join Early Access
            </Link>
            <Link href="/docs" className="button-secondary">
              Review Platform Docs
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="surface-card p-8 md:p-10">
          <div className="mb-6 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Current Milestones</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {milestones.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
