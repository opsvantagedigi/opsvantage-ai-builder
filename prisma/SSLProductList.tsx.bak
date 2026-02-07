'use client';

import { useEffect, useState } from 'react';
import { getSSLProductsAction } from './ssl-actions';

interface SSLProduct {
  id: number;
  name: string;
  brand_name: string;
  description: string;
  prices: {
    price: {
      reseller: {
        price: string;
        currency: string;
      };
    };
  }[];
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
        setProducts(result.products || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <p className="text-slate-400">Loading SSL certificates...</p>;
  }

  if (error) {
    return <p className="text-red-400">Error: {error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.slice(0, 3).map((product) => ( // Displaying first 3 for brevity
        <div key={product.id} className="p-6 border border-slate-800 rounded-xl bg-slate-900/50">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-slate-400 text-sm mt-2">by {product.brand_name}</p>
          <div className="mt-4 text-2xl font-bold">
            {product.prices?.[0]?.price.reseller.currency}{' '}
            {product.prices?.[0]?.price.reseller.price}{' '}
            <span className="text-sm font-normal text-slate-500">/yr</span>
          </div>
        </div>
      ))}
    </div>
  );
}