export type HeroContent = {
  id: string;
  phase: string | null;
  headline: string;
  subheader: string;
  ctaLabel: string;
  ctaHref: string | null;
};

const NARRATIVE_PHASES: HeroContent[] = [
  {
    id: 'narrative-1',
    phase: 'Feb 18–19',
    headline: 'The Era of the Template is Over.',
    subheader: 'Stop building websites. Start commanding a Legacy.',
    ctaLabel: 'Join the Sovereign Funnel',
    ctaHref: '#waitlist',
  },
  {
    id: 'narrative-2',
    phase: 'Feb 20–21',
    headline: 'Meet MARZ: Your Sovereign Partner.',
    subheader: 'The first AI Agent that grows your business while you sleep.',
    ctaLabel: 'Summon MARZ',
    ctaHref: '#waitlist',
  },
  {
    id: 'narrative-3',
    phase: 'Feb 22–23',
    headline: 'Claim Your Spot in the Sovereign 25.',
    subheader: '25 Slots. Lifetime access. 100% Digital Sovereignty.',
    ctaLabel: 'Secure the Sovereign 25',
    ctaHref: '#waitlist',
  },
  {
    id: 'narrative-4',
    phase: 'Feb 24–25',
    headline: 'The Ghost Site Reveal.',
    subheader: 'Watch MARZ generate world-class sites — proof, not promises.',
    ctaLabel: 'Enter the Ghost Site Lottery',
    ctaHref: '#waitlist',
  },
  {
    id: 'narrative-5',
    phase: 'Feb 26–27',
    headline: '48-Hour Zenith Countdown.',
    subheader: 'THE ZENITH is capped globally. One spin. One legacy.',
    ctaLabel: 'Spin for THE ZENITH',
    ctaHref: '#waitlist',
  },
];

function getNztDateKeyParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '1');
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '1');

  return { year, month, day };
}

function getNarrativePhaseIndex(total: number) {
  // Phase = Math.floor(DaysSinceFeb18 / 2) % 5
  // Use NZT day boundaries so the narrative flips on NZ time.
  const now = new Date();
  const { year, month, day } = getNztDateKeyParts(now);

  const todayUtcMidnight = Date.UTC(year, month - 1, day);
  const startUtcMidnight = Date.UTC(2026, 1, 18); // Feb 18, 2026
  const elapsedMs = Math.max(0, todayUtcMidnight - startUtcMidnight);
  const daysSince = Math.floor(elapsedMs / 86_400_000);

  const index = Math.floor(daysSince / 2) % total;
  return index;
}

export async function getDynamicHeroContent(): Promise<HeroContent> {
  const pool = NARRATIVE_PHASES;
  return pool[getNarrativePhaseIndex(pool.length)];
}
