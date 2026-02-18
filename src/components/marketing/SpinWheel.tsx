'use client';

import { useMemo, useRef, useState } from 'react';
import { PrizeWheel, type PrizeWheelRef, type Sector } from '@mertercelik/react-prize-wheel';

export type WheelPrizeId =
  | 'queue_jump'
  | 'sovereign_25_discount_code'
  | 'free_custom_domain'
  | 'zenith_lifetime_pro';

const SEGMENTS: Array<{ id: WheelPrizeId; label: string; probability: number }> = [
  { id: 'queue_jump', label: 'Queue Jump (+100 Spots)', probability: 50 },
  { id: 'sovereign_25_discount_code', label: 'Sovereign 25 (Extra 10% Off)', probability: 25 },
  { id: 'free_custom_domain', label: 'Free Custom Domain (1 Year)', probability: 15 },
  { id: 'zenith_lifetime_pro', label: 'THE ZENITH', probability: 10 },
];

export function SpinWheel(props: {
  onSpinEndAction: (prizeId: WheelPrizeId) => void;
  disabled?: boolean;
}) {
  const { onSpinEndAction, disabled } = props;
  const wheelRef = useRef<PrizeWheelRef>(null);
  const [spinning, setSpinning] = useState(false);

  const sectors = useMemo<Sector[]>(
    () =>
      SEGMENTS.map((s) => ({
        id: s.id,
        label: s.label,
        probability: s.probability,
      })),
    [],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur dark:border-amber-500/30 dark:bg-slate-950/50">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-amber-200">Spin the Wheel</div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">One spin per email. Your reward is reserved.</p>

      <div className="mt-5 flex items-center justify-center">
        <div className="w-full max-w-[340px]">
          <PrizeWheel
            ref={wheelRef}
            sectors={sectors}
            duration={3.8}
            minSpins={5}
            maxSpins={7}
            frameColor={'var(--primary)'}
            middleColor={'var(--primary)'}
            middleDotColor={'var(--accent)'}
            winIndicatorColor={'var(--accent)'}
            winIndicatorDotColor={'var(--primary)'}
            sticksColor={'var(--accent)'}
            textFontSize={12}
            onSpinStart={() => setSpinning(true)}
            onSpinEnd={(sector) => {
              setSpinning(false);
              onSpinEndAction(String(sector.id) as WheelPrizeId);
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end">
        <button
          className="button-primary"
          onClick={() => wheelRef.current?.spin()}
          disabled={Boolean(disabled) || spinning || Boolean(wheelRef.current?.isSpinning)}
        >
          {spinning ? 'Spinning…' : 'Spin'}
        </button>
      </div>
    </div>
  );
}
