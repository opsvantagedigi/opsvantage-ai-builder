import React, { useState } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { Search, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';

type Props = {
	onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
	onBack?: () => void;
	initialData?: Partial<OnboardingData>;
	isSaving?: boolean;
};

export default function StrategyStep({ onNext, onBack, initialData, isSaving }: Props) {
	const [competitors, setCompetitors] = useState(
		Array.isArray(initialData?.competitors) ? (initialData.competitors || []).join(', ') : (initialData?.competitors || '')
	);

	const handleNext = () => {
		const competitorList = typeof competitors === 'string'
			? competitors.split(',').map(s => s.trim()).filter(Boolean)
			: competitors;
		onNext({ competitors: competitorList as string[] });
	};

	return (
		<div className="max-w-2xl mx-auto">
			<div className="glass p-8 md:p-12 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />

				<div className="relative z-10">
					<h2 className="text-3xl font-bold font-display text-white mb-2">Market Strategy</h2>
					<p className="text-slate-400 mb-10">Let's look at the competitive landscape to differentiate your brand.</p>

					<div className="space-y-6">
						<div className="space-y-2">
							<label className="text-sm font-semibold text-slate-300 flex items-center">
								<Search className="w-4 h-4 mr-2 text-amber-400" />
								Main Competitors
							</label>
							<input
								type="text"
								className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
								placeholder="e.g. Competitor A, Competitor B (comma separated)"
								value={competitors}
								onChange={(e) => setCompetitors(e.target.value)}
							/>
						</div>

						<div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start space-x-4">
							<TrendingUp className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
							<div>
								<h4 className="text-sm font-bold text-white mb-1">Growth Tip</h4>
								<p className="text-xs text-slate-400 leading-relaxed">
									Identifying your top competitors allows our AI to analyze their site structures and suggest superior layouts for your niche.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-10 flex justify-between items-center">
						<button
							onClick={onBack}
							className="flex items-center text-slate-400 hover:text-white transition-colors"
						>
							<ChevronLeft className="mr-1 w-5 h-5" />
							Back
						</button>
						<button
							onClick={handleNext}
							disabled={isSaving}
							className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center hover:bg-blue-500 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
						>
							{isSaving ? 'Saving...' : 'Almost there'}
							<ChevronRight className="ml-2 w-5 h-5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
