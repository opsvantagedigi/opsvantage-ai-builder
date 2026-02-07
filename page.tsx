import { DomainSearch } from '@/components/domains/DomainSearch';

export default function DomainsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Domain & Security Center
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your digital assets. Whitelabel domains and enterprise-grade SSL protection.
          </p>
        </header>

        <section className="mb-16">
          <DomainSearch />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Enterprise SSL Certificates</h2>
          {/* List of SSL products fetched via Server Action from OpenProvider */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* TODO: Map through SSL products here */}
             <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50">
                <h3 className="text-xl font-bold">RapidSSL</h3>
                <p className="text-slate-400 text-sm mt-2">Ideal for entry-level sites.</p>
                <div className="mt-4 text-2xl font-bold">$15.00 <span className="text-sm font-normal text-slate-500">/yr</span></div>
             </div>
             {/* ... more cards */}
          </div>
        </section>
      </div>
    </div>
  );
}