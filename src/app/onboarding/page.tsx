import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import OnboardingFlow from '../../components/onboarding/OnboardingFlow';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/onboarding');
  }

  return (
    <div className="min-h-screen mesh-gradient flex flex-col selection:bg-blue-500/30">
      <div className="py-12 px-4 sm:px-6 lg:px-8 grow flex items-center justify-center">
        <OnboardingFlow />
      </div>
      <div className="py-6 text-center text-slate-600 text-[10px] font-bold tracking-widest uppercase">
        OpsVantage AI Onboarding v2.0
      </div>
    </div>
  );
}
