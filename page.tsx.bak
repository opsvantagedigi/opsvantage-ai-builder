import { DomainSearch } from '@/components/domains/DomainSearch';
import { SSLProductList } from '@/components/domains/SSLProductList';
import { Suspense } from 'react';

function DomainSearchSuspenseWrapper() {
  return (
    <Suspense fallback={<div className="w-full max-w-3xl mx-auto h-48 bg-slate-900/50 rounded-2xl animate-pulse" />}>
      <DomainSearch />
    </Suspense>
  );
}

export default function DomainServicesPage() {
  return (
    <div className="p-8 text-white min-h-screen">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          Domain & Security Center
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Find your perfect domain name and secure your online presence with enterprise-grade SSL certificates.
        </p>
      </header>

      <section className="mb-24 flex justify-center">
        <DomainSearchSuspenseWrapper />
      </section>

      <section>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Enterprise SSL Certificates</h2>
          <p className="text-slate-400 text-lg">Encrypt visitor data and build trust with a globally recognized SSL.</p>
        </div>
        <Suspense fallback={<div className="h-64 w-full animate-pulse bg-slate-900/50 rounded-2xl" />}>
          <SSLProductList />
        </Suspense>
      </section>
    </div>
  );
}