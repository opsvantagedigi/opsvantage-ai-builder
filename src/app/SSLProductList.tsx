'use client';

import { useEffect, useState } from 'react';
import { getSSLProductsAction } from '../../prisma/ssl-actions';
import { ShieldCheck } from 'lucide-react';

interface SSLProduct {
  id: number;
  name: string;
  brand: string;
  prices: { price: { reseller: { price: string; currency: string } } }[];
}

export function SSLProductList() {
  const [products, setProducts] = useState<SSLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      const result = await getSSLProductsAction();
      if (result.error) {
        setError(result.error);
      } else {
        // Displaying a curated list for a clean UI
        const filtered = (result.products as unknown as SSLProduct[])?.filter((p: SSLProduct) => ['Sectigo', 'RapidSSL', 'GeoTrust'].includes(p.brand)).slice(0, 3) || [];
        setProducts(filtered);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-8 bg-slate-900/50 rounded-2xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-400">Could not load SSL products: {error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {products.map((product) => (
        <div key={product.id} className="p-8 bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-4 grow">
            <ShieldCheck className="text-green-400" size={28} />
            <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
          </div>
          <p className="text-4xl font-bold mb-6">
            ${product.prices?.[0]?.price.reseller.price}<span className="text-base font-normal text-slate-400">/ year</span>
          </p>
          <div className="grow mb-8" />
          <button className="w-full py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors">
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}