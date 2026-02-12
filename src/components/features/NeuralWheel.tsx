'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Trophy, Gift, Zap } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    value: number;
    description: string;
  }[];
}

interface FoundersOffer {
  id: string;
  name: string;
  description: string;
  savings: number;
  savingsAmount?: number;
  duration?: string;
  icon: React.ReactNode;
  available: boolean;
}

interface OfferStatus {
  offerId: string;
  claimed: number;
  limit: number | null;
  remaining: number | null;
  exhausted: boolean;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'scale',
    question: 'What is the scale of your project?',
    options: [
      {
        id: 'personal',
        label: 'Personal/Side Project',
        value: 1,
        description: 'Hobby projects, portfolio sites, personal blogs'
      },
      {
        id: 'business',
        label: 'Small Business',
        value: 2,
        description: 'Startup, small business, agency client work'
      },
      {
        id: 'enterprise',
        label: 'Enterprise',
        value: 3,
        description: 'Large corporation, high-traffic applications'
      }
    ]
  },
  {
    id: 'security',
    question: 'How important is security to your project?',
    options: [
      {
        id: 'basic',
        label: 'Basic Security',
        value: 1,
        description: 'Standard SSL, basic protection'
      },
      {
        id: 'advanced',
        label: 'Advanced Security',
        value: 2,
        description: 'EV SSL, spam filtering, DDoS protection'
      },
      {
        id: 'enterprise-security',
        label: 'Enterprise Security',
        value: 3,
        description: 'Multi-layer security, compliance requirements'
      }
    ]
  },
  {
    id: 'growth',
    question: 'What are your growth expectations?',
    options: [
      {
        id: 'stable',
        label: 'Stable Traffic',
        value: 1,
        description: 'Consistent, predictable traffic'
      },
      {
        id: 'moderate',
        label: 'Moderate Growth',
        value: 2,
        description: 'Growing user base, expanding features'
      },
      {
        id: 'aggressive',
        label: 'Aggressive Scaling',
        value: 3,
        description: 'Rapid expansion, high scalability needs'
      }
    ]
  }
];

const foundersOffers: FoundersOffer[] = [
  {
    id: 'estate-founder',
    name: 'The Estate Founder',
    description: 'A .com registration for $0.99',
    savings: 95, // Savings percentage
    icon: <Gift className="h-6 w-6" />,
    available: true // Limited to 50 total
  },
  {
    id: 'wholesale-ghost',
    name: 'The Wholesale Ghost',
    description: '0% markup on all products for 12 months',
    savings: 100, // 100% savings on markup
    duration: '12 months',
    icon: <Zap className="h-6 w-6" />,
    available: true // Limited to 25 total
  },
  {
    id: 'architect-choice',
    name: "Architect's Choice",
    description: 'Free SpamExpert and Standard SSL for life of domain',
    savings: 100, // 100% savings
    duration: 'Life of domain',
    icon: <Trophy className="h-6 w-6" />,
    available: true // Limited to 25 per tier
  },
  {
    id: 'zenith-discount-15',
    name: '15% Zenith Discount',
    description: '15% discount on all products for 12 months',
    savings: 15,
    duration: '12 months',
    icon: <Zap className="h-6 w-6" />,
    available: true
  }
];

export default function NeuralWheel() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [recommendedOffers, setRecommendedOffers] = useState<FoundersOffer[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [offerStatuses, setOfferStatuses] = useState<Record<string, OfferStatus>>({});
  const [statusLoading, setStatusLoading] = useState(true);
  const [claimingOfferId, setClaimingOfferId] = useState<string | null>(null);
  const [claimMessages, setClaimMessages] = useState<Record<string, string>>({});

  const wholesaleStatus = offerStatuses['wholesale-ghost'];
  const wholesaleExhausted = wholesaleStatus?.exhausted ?? false;

  const resolveOfferId = (offerId: string) => {
    if (offerId === 'wholesale-ghost' && wholesaleExhausted) {
      return 'zenith-discount-15';
    }
    return offerId;
  };

  const getOfferById = (offerId: string) => foundersOffers.find((offer) => offer.id === resolveOfferId(offerId));

  const spinPool = wholesaleExhausted
    ? foundersOffers.filter((offer) => offer.id !== 'wholesale-ghost')
    : foundersOffers.filter((offer) => offer.id !== 'zenith-discount-15');

  useEffect(() => {
    let mounted = true;

    const loadStatuses = async () => {
      try {
        const response = await fetch('/api/claims/status?offerId=wholesale-ghost', { cache: 'no-store' });
        const data = await response.json();
        const status = data?.offers?.['wholesale-ghost'] as OfferStatus | undefined;

        if (!mounted) return;
        if (status) {
          setOfferStatuses({ 'wholesale-ghost': status });
        }
      } catch {
        if (mounted) {
          setOfferStatuses({});
        }
      } finally {
        if (mounted) {
          setStatusLoading(false);
        }
      }
    };

    loadStatuses();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAnswer = (questionId: string, optionId: string) => {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      calculateRecommendedOffers(nextAnswers);
    }
  };

  const calculateRecommendedOffers = (answersInput: Record<string, string>) => {
    // Simple logic to determine recommended offers based on answers
    // In a real implementation, this would be more sophisticated
    const userScore = Object.values(answersInput).reduce((acc, answerId) => {
      const question = quizQuestions.find(q => 
        q.options.some(o => o.id === answerId)
      );
      if (question) {
        const option = question.options.find(o => o.id === answerId);
        return acc + (option?.value || 0);
      }
      return acc;
    }, 0);

    // Determine which offers to recommend based on score and answers
    let selectedOfferIds: string[] = [];
    
    if (userScore < 4) {
      // Personal projects get basic offers
      selectedOfferIds = ['estate-founder'];
    } else if (userScore < 7) {
      // Small business gets middle offers
      selectedOfferIds = ['estate-founder', 'architect-choice'];
    } else {
      // Enterprise gets premium offers
      selectedOfferIds = ['wholesale-ghost', 'architect-choice'];
    }

    // Add special offers based on specific answers
    if (answersInput.security === 'enterprise-security' || answersInput.growth === 'aggressive') {
      // Add the Architect's Choice offer if they selected high security or aggressive growth
      if (!selectedOfferIds.includes('architect-choice')) {
        selectedOfferIds.push('architect-choice');
      }
    }

    const selectedOffers = selectedOfferIds
      .map((offerId) => getOfferById(offerId))
      .filter((offer): offer is FoundersOffer => Boolean(offer));

    setRecommendedOffers(selectedOffers);
  };

  useEffect(() => {
    setRecommendedOffers((prev) =>
      prev.map((offer) => {
        if (offer.id !== 'wholesale-ghost' || !wholesaleExhausted) {
          return offer;
        }
        return getOfferById('wholesale-ghost') ?? offer;
      })
    );
  }, [wholesaleExhausted]);

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setQuizCompleted(false);
    setRecommendedOffers([]);
    setClaimMessages({});
  };

  const handleClaim = async (offerId: string) => {
    setClaimingOfferId(offerId);
    setClaimMessages((prev) => ({ ...prev, [offerId]: '' }));

    try {
      const response = await fetch('/api/claims/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId })
      });

      const payload = await response.json();
      if (!response.ok) {
        setClaimMessages((prev) => ({
          ...prev,
          [offerId]: payload?.error || 'Unable to claim this offer right now.'
        }));
        return;
      }

      const status = payload?.status as OfferStatus | undefined;
      if (status?.offerId === 'wholesale-ghost') {
        setOfferStatuses((prev) => ({ ...prev, 'wholesale-ghost': status }));
      }

      setClaimMessages((prev) => ({ ...prev, [offerId]: 'Offer claimed successfully.' }));
    } catch {
      setClaimMessages((prev) => ({ ...prev, [offerId]: 'Unable to claim this offer right now.' }));
    } finally {
      setClaimingOfferId(null);
    }
  };

  const spinWheel = () => {
    setSpinning(true);
    // Simulate wheel spinning effect
    setTimeout(() => {
      setSpinning(false);
      // Show a random offer as the result
      const randomOffer = spinPool[Math.floor(Math.random() * spinPool.length)];
      setRecommendedOffers([randomOffer]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Exclusive Founders 25 Launch Offer</span>
          </div>
          <div className="mb-4">
            {statusLoading ? (
              <Badge variant="secondary">Checking offer availability...</Badge>
            ) : wholesaleStatus?.remaining !== null && !wholesaleExhausted ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                {wholesaleStatus.remaining} spots remaining for Wholesale Ghost
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100">
                Wholesale Ghost claimed out — 15% Zenith Discount is now active
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            AI Architect Blueprint
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Answer a few questions to unlock your personalized infrastructure roadmap with exclusive launch discounts.
          </p>
        </div>

        {!quizCompleted ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">
                  {quizQuestions[currentQuestion].question}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizQuestions[currentQuestion].options.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={`w-full justify-start text-left p-4 h-auto ${
                        answers[quizQuestions[currentQuestion].id] === option.id
                          ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                      onClick={() => handleAnswer(quizQuestions[currentQuestion].id, option.id)}
                    >
                      <div className="flex items-start">
                        <div className={`mr-3 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                          answers[quizQuestions[currentQuestion].id] === option.id
                            ? 'border-cyan-500 bg-cyan-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {answers[quizQuestions[currentQuestion].id] === option.id && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {option.label}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-xl mb-8">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="h-10 w-10 text-cyan-500" />
                </div>
                <CardTitle className="text-2xl text-center text-slate-900 dark:text-slate-100">
                  Your Personalized Infrastructure Roadmap
                </CardTitle>
                <CardDescription className="text-center text-slate-600 dark:text-slate-300">
                  Based on your responses, here are our top recommendations for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedOffers.map((offer) => (
                    (() => {
                      const isWholesale = offer.id === 'wholesale-ghost';
                      const status = isWholesale ? offerStatuses['wholesale-ghost'] : undefined;
                      const exhausted = status?.exhausted ?? false;
                      const claimMessage = claimMessages[offer.id];

                      return (
                    <Card 
                      key={offer.id} 
                      className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-0 shadow-md"
                    >
                      <CardHeader>
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white mr-3">
                            {offer.icon}
                          </div>
                          <CardTitle className="text-slate-900 dark:text-slate-100">
                            {offer.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-700 dark:text-slate-300">
                          {offer.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Savings</span>
                            <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900">
                              {offer.savings}% off
                            </Badge>
                          </div>
                          
                          {offer.savingsAmount && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Value</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                Save ${offer.savingsAmount}
                              </span>
                            </div>
                          )}
                          
                          {offer.duration && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Duration</span>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {offer.duration}
                              </span>
                            </div>
                          )}
                          
                          <Button
                            disabled={exhausted || claimingOfferId === offer.id}
                            onClick={() => handleClaim(offer.id)}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white mt-4 disabled:opacity-60"
                          >
                            {claimingOfferId === offer.id ? 'Claiming...' : exhausted ? 'Fully Claimed' : 'Claim Offer'}
                            {!exhausted && <ArrowRight className="ml-2 h-4 w-4" />}
                          </Button>
                          {claimMessage && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{claimMessage}</p>
                          )}
                          {isWholesale && status?.remaining !== null && !exhausted && (
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                              {status.remaining} spots remaining
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                      );
                    })()
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    variant="outline" 
                    onClick={resetQuiz}
                    className="mr-4 border-slate-300 dark:border-slate-700"
                  >
                    Retake Quiz
                  </Button>
                  <Button 
                    onClick={spinWheel}
                    disabled={spinning}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    {spinning ? 'Spinning...' : 'Try the Neural Wheel'}
                  </Button>
                  
                  {spinning && (
                    <div className="mt-6 flex justify-center">
                      <div className="relative w-48 h-48 rounded-full border-4 border-cyan-500 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Spinning...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Ready to Build Your Infrastructure?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
                Take advantage of our Founders 25 launch offers and get started with the best infrastructure at the lowest prices.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => router.push('/services')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                >
                  Browse Services <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/onboarding')}
                  className="border-slate-300 dark:border-slate-700"
                >
                  Start Building
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}