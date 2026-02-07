// DomainSearch component moved from root to components/domains/DomainSearch.tsx
'use client'

import { useState } from 'react';
import { checkDomainAvailabilityAction } from '../../domain-actions';
import { Loader2 } from 'lucide-react';

export function DomainSearch() {
  const [query, setQuery] = useState('');
  // const [result, setResult] = useState<{ status?: string; domain?: string; price?: { currency: string; amount: string }; isPremium?: boolean; error?: string } | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Removed unused error, showCustomerForm, isCreatingHandle, session

  const handleSearch = async () => { 
    if (!query) return;
    setLoading(true);
    const result = await checkDomainAvailabilityAction(query);
    setLoading(false);
  };

  // const handleBuyNow = async () => {
  //   // First, check if a handle exists or needs to be created.
  //   const handleResult = await getOrCreateCustomerHandleAction();
  //   if (handleResult.error) {
  //     setError(handleResult.error);
  //     return;
  //   }
  //
  //   if (handleResult.needsData) {
  //     // If no handle, show the form to collect customer data.
  //     setShowCustomerForm(true);
  //   } else if (handleResult.handle) {
  //     // If handle exists, proceed to payment (NowPayments integration would go here).
  //     console.log('Proceeding to payment for domain:', result.domain, 'with handle:', handleResult.handle);
  //     alert(`Handle found: ${handleResult.handle}. Ready for payment integration.`);
  //   }
  // };

  // const handleCustomerFormSubmit = async (data: CustomerData) => {
  //   setIsCreatingHandle(true);
  //   const handleResult = await getOrCreateCustomerHandleAction(data);
  //   setIsCreatingHandle(false);
  //   setShowCustomerForm(false);
  //   if (handleResult.handle) handleBuyNow(); // Re-run buy logic now that we have a handle
  //   else if (handleResult.error) setError(handleResult.error);
  // };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-2">Find your perfect domain</h2>
      <p className="text-slate-400 mb-6">Secure your brand identity with our enterprise registrar service.</p>
      
      <div className="flex gap-2">
        <input 
          placeholder="opsvantage.com" 
          value={query}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-slate-950 text-white h-12"
        />
        <button 
          onClick={handleSearch} 
          disabled={loading}
          className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Search"}
        </button>
      </div>
      {/* ...rest of the component... */}
    </div>
  );
}
