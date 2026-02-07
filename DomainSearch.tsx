'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { checkDomainAvailabilityAction } from './domain-actions';
import { getOrCreateCustomerHandleAction, CustomerData } from './prisma/customer-actions';
import { Loader2, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { CustomerHandleForm } from './prisma/CustomerHandleForm';

export function DomainSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<
    | {
        domain: string;
        status: 'free' | 'taken';
        price?: { currency: string; amount: number };
      }
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isCreatingHandle, setIsCreatingHandle] = useState(false);
  const { data: session } = useSession();

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    setError(null);
    
    const data = await checkDomainAvailabilityAction(query);
    if (data.error || !data.domain || !data.status) {
      setError(data.error || 'Unknown error');
      setResult(null);
    } else {
      setResult({
        domain: String(data.domain),
        status: data.status === 'free' ? 'free' : 'taken',
        price:
          data.price && typeof data.price === 'object' && 'currency' in data.price && 'amount' in data.price
            ? { currency: String(data.price.currency), amount: Number(data.price.amount) }
            : undefined,
      });
    }
    setLoading(false);
  };

  const handleBuyNow = async () => {
    // First, check if a handle exists or needs to be created.
    if (!session?.user) {
      setError('User session required to buy domain.');
      return;
    }
    setIsCreatingHandle(true);
    setError(null);
    // Collect customer data from session (or show form if missing)
    const customerData = {
      name: {
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
      },
      address: {
        street: '',
        number: '',
        zipcode: '',
        city: '',
        country: '',
      },
      phone: {
        countryCode: '',
        areaCode: '',
        subscriberNumber: '',
      },
      email: session.user.email || '',
    };
    // If required fields are missing, show form
    if (!customerData.name.firstName || !customerData.name.lastName || !customerData.email) {
      setShowCustomerForm(true);
      setIsCreatingHandle(false);
      return;
    }
    const handleResult = await getOrCreateCustomerHandleAction(customerData);
    setIsCreatingHandle(false);
    if (handleResult && typeof handleResult === 'object') {
      if ('error' in handleResult && handleResult.error) {
        setError(handleResult.error);
        return;
      }
      if ('handle' in handleResult && handleResult.handle && result) {
        // Proceed to payment integration here
        console.log('Proceeding to payment for domain:', result.domain, 'with handle:', handleResult.handle);
        alert(`Handle found: ${handleResult.handle}. Ready for payment integration.`);
      }
    }
  };

  const handleCustomerFormSubmit = async (data: CustomerData) => {
    setIsCreatingHandle(true);
    const handleResult = await getOrCreateCustomerHandleAction(data);
    setIsCreatingHandle(false);
    setShowCustomerForm(false);
    if (handleResult && typeof handleResult === 'object' && 'handle' in handleResult && handleResult.handle) {
      // Re-run buy logic now that we have a handle
      handleBuyNow();
    } else if (handleResult && typeof handleResult === 'object' && 'error' in handleResult && handleResult.error) {
      setError(handleResult.error);
    }
  };

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

      {showCustomerForm && session?.user && (
        <CustomerHandleForm
          userEmail={session.user.email || ''}
          userName={session.user.name || ''}
          onSubmit={handleCustomerFormSubmit}
          onCancel={() => setShowCustomerForm(false)}
          isLoading={isCreatingHandle}
        />
      )}

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {result && (
        <div className="mt-6 p-4 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{result.domain}</h3>
            <div className="flex items-center gap-2 mt-1">
              {result.status === 'free' ? (
                <span className="text-green-400 flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" /> Available
                </span>
              ) : (
                <span className="text-red-400 flex items-center text-sm">
                  <XCircle className="w-4 h-4 mr-1" /> Unavailable
                </span>
              )}
            </div>
          </div>

          {result && result.status === 'free' && result.price && typeof result.price === 'object' && 'currency' in result.price && 'amount' in result.price && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {String(result.price.currency)} {String(result.price.amount)}
                </p>
                <p className="text-xs text-slate-500">per year</p>
              </div>
              <button onClick={handleBuyNow} className="h-12 px-4 bg-green-600 hover:bg-green-500 text-white rounded-md flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}