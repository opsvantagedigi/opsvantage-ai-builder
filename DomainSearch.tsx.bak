'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { checkDomainAvailabilityAction, registerDomainAction } from './domain-actions';
import { createCustomerHandleAction, CustomerData } from './customer-actions';
import { Search, Check, X, Loader2, ShoppingCart } from 'lucide-react';
import { CustomerHandleForm } from './CustomerHandleForm';
import { motion, AnimatePresence } from 'framer-motion';

type SearchResult = {
  status?: string;
  domain?: string;
  price?: { currency: string; amount: string };
  isPremium?: boolean;
  error?: string;
};

type UserInfo = {
  email?: string | null;
  name?: string | null;
};

export function DomainSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get('query') || '';
  const [domain, setDomain] = useState(initialQuery);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleSearch = async (searchDomain: string) => {
    if (!searchDomain.includes('.')) {
      setResult({ error: 'Please enter a full domain name, including the extension (e.g., example.com).' });
      return;
    }
    setLoading(true);
    setResult(null);
    const response = await checkDomainAvailabilityAction(searchDomain);
    setResult(response);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (domain) {
      handleSearch(domain);
    }
  };

  const handleRegister = async () => {
    if (!result?.domain || !result.price) return;

    setIsRegistering(true);
    const response = await registerDomainAction(result.domain, result.price);

    if (response.needsCustomerData) {
      setUserInfo(response.user);
      setShowCustomerForm(true);
    } else if (response.error) {
      // In a real app, you'd use a toast notification here
      alert(`Error: ${response.error}`);
    } else if (response.paymentUrl) {
      router.push(response.paymentUrl);
    }
    setIsRegistering(false);
  };

  const handleCustomerFormSubmit = async (data: CustomerData) => {
    setIsRegistering(true);
    const handleResult = await createCustomerHandleAction(data);
    if (handleResult.error) {
      alert(`Error: ${handleResult.error}`);
      setIsRegistering(false);
    } else if (handleResult.success) {
      // Handle created, now re-attempt registration
      setShowCustomerForm(false);
      await handleRegister();
    }
  };

  // Check for payment status from query params to show feedback
  // In a real app, use toast notifications.
  useEffect(() => {
    if (searchParams.get('payment') === 'cancelled') {
      alert('Payment was cancelled.');
      router.replace(pathname); // Clear query params
    }
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/20">
      {showCustomerForm && userInfo && (
        <CustomerHandleForm
          userEmail={userInfo.email || ''}
          userName={userInfo.name || ''}
          onSubmit={handleCustomerFormSubmit}
          onCancel={() => setShowCustomerForm(false)}
          isLoading={isRegistering}
        />
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="relative grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="your-dream-domain.com"
            className="w-full h-14 pl-12 pr-4 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-14 px-8 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Search'}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-5 bg-slate-950/70 border border-slate-800 rounded-lg"
          >
            {result.error && (
              <div className="flex items-center gap-3 text-red-400">
                <X size={24} />
                <p className="font-medium">{result.error}</p>
              </div>
            )}
            {result.status === 'available' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check size={24} className="text-green-400" />
                  <p className="font-bold text-lg text-white">{result.domain} is available!</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-cyan-400">
                    ${result.price?.amount} <span className="text-sm text-slate-400">/ year</span>
                  </span>
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-wait"
                  >
                    {isRegistering ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                    {isRegistering ? 'Redirecting...' : 'Register'}
                  </button>
                </div>
              </div>
            )}
            {result.status === 'unavailable' && (
              <div className="flex items-center gap-3 text-amber-400">
                <X size={24} />
                <p className="font-medium text-lg">{result.domain} is already taken.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}