import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services | OpsVantage Digital',
  description: 'Professional-grade infrastructure services at disruptive prices',
};

export default function ServicesPage() {
  const serviceCategories = [
    {
      id: 'domains',
      title: 'Domain Registration',
      description: 'Secure your brand identity with premium domain names',
      icon: '🌐',
      savings: 'Save up to 90%',
    },
    {
      id: 'ssl',
      title: 'SSL Certificates',
      description: 'Encrypt data transmission and build visitor trust',
      icon: '🔒',
      savings: 'Save up to 80%',
    },
    {
      id: 'licenses',
      title: 'Hosting Licenses',
      description: 'Powerful control panels and automation tools',
      icon: '⚙️',
      savings: 'Save up to 70%',
    },
    {
      id: 'security',
      title: 'Advanced Security',
      description: 'Comprehensive protection against threats',
      icon: '🛡️',
      savings: 'Save up to 60%',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Infrastructure Services</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 opacity-90">
            Professional-grade infrastructure at disruptive prices. Everything you need to build, deploy, and scale.
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-sm">
            <span className="mr-2">⚡</span> 
            <span>Founders 25: Exclusive launch offers available now</span>
          </div>
        </div>
      </section>

      {/* Primary Services Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Essential Infrastructure
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            One hub for domains, security, and server management—priced for sustainable delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceCategories.map((category) => (
            <Link href={`/services/${category.id}`} key={category.id}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:-translate-y-1">
                <CardHeader>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <CardTitle className="text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900">
                      {category.savings} off
                    </Badge>
                    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                      View Plans →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about our infrastructure services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: "How do your prices compare to competitors?",
              answer: "Our disruptor pricing model offers savings of 40-90% compared to traditional providers like GoDaddy and Namecheap, thanks to our direct partnerships and wholesale access."
            },
            {
              question: "Are there any setup fees?",
              answer: "No, all our services have zero setup fees. You only pay for what you use."
            },
            {
              question: "Can I upgrade my services later?",
              answer: "Absolutely. All our services are designed to scale with your needs. Upgrade anytime from your dashboard."
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, PayPal, and cryptocurrency payments for enterprise clients."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
                {faq.question}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}