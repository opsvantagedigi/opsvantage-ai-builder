import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { catalog } from '@/lib/openprovider/catalog';
import { getFormattedPriceWithSavings } from '@/lib/pricing-engine';
import { ArrowRight, Server, Shield, Lock, Globe } from 'lucide-react';

// Define available categories
const CATEGORIES = {
  domains: {
    title: 'Domain Registration',
    description: 'Secure your brand identity with premium domain names',
    icon: Globe,
    color: 'from-purple-600 to-indigo-600'
  },
  ssl: {
    title: 'SSL Certificates',
    description: 'Encrypt data transmission and build visitor trust',
    icon: Lock,
    color: 'from-cyan-600 to-blue-600'
  },
  licenses: {
    title: 'Hosting Licenses',
    description: 'Powerful control panels and automation tools',
    icon: Server,
    color: 'from-emerald-600 to-teal-600'
  },
  security: {
    title: 'Advanced Security',
    description: 'Comprehensive protection against threats',
    icon: Shield,
    color: 'from-amber-600 to-orange-600'
  }
};

interface CategoryPageProps {
  params: {
    category: keyof typeof CATEGORIES;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = CATEGORIES[params.category];
  if (!category) {
    return {};
  }

  return {
    title: `${category.title} | Services | OpsVantage Digital`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = CATEGORIES[params.category];
  if (!category) {
    notFound();
  }

  // Fetch products based on category
  let products: any[] = [];
  try {
    switch (params.category) {
      case 'domains':
        // For domains, we'll use sample data since the actual check requires specific domains
        products = [
          { name: 'Standard Domain (.com)', description: 'Perfect for startups and small businesses', basePrice: 10.99 },
          { name: 'Premium Domain (.io)', description: 'Ideal for tech companies and developers', basePrice: 25.99 },
          { name: 'Business Domain (.biz)', description: 'Professional business identity', basePrice: 12.99 },
          { name: 'Global Domain (.global)', description: 'Reach a worldwide audience', basePrice: 17.99 },
          { name: 'Tech Domain (.tech)', description: 'Modern and innovative brand identity', basePrice: 15.99 },
          { name: 'Developer Domain (.dev)', description: 'Optimized for developers and tech projects', basePrice: 14.99 },
        ];
        break;
      case 'ssl':
        // Fetch SSL products from API
        const sslData = await catalog.ssl.getProducts();
        products = (sslData.results || []).slice(0, 6).map((product: any) => ({
          name: product.brand_name || product.name || product.code,
          description: product.description || 'SSL certificate for secure connections',
          basePrice: product.price?.reseller?.price || product.price?.price || 59.99,
          code: product.code
        }));
        break;
      case 'licenses':
        // Fetch license products from API
        const licenseData = await catalog.licenses.getItems();
        products = (licenseData.results || []).slice(0, 6).map((product: any) => ({
          name: product.name || product.code,
          description: product.description || 'Hosting license',
          basePrice: product.price?.reseller?.price || product.price?.price || 99.99,
          code: product.code
        }));
        break;
      case 'security':
        // Sample security products
        products = [
          { name: 'SpamExpert Email Security', description: 'Advanced spam and malware filtering', basePrice: 45.99 },
          { name: 'DDoS Protection Basic', description: 'Basic DDoS protection for websites', basePrice: 75.99 },
          { name: 'Web Application Firewall', description: 'Protects against web-based attacks', basePrice: 125.99 },
          { name: 'Enterprise Security Suite', description: 'Complete security solution', basePrice: 195.99 },
        ];
        break;
      default:
        products = [];
    }
  } catch (error) {
    console.error(`Error fetching products for category ${params.category}:`, error);
    // Fallback to empty array
    products = [];
  }

  // Process products with pricing
  const processedProducts = products.map(product => {
    const pricingInfo = getFormattedPriceWithSavings(
      params.category as any,
      product.basePrice,
      params.category === 'domains' ? product.name.split('.').pop() : undefined,
      params.category === 'ssl' ? product.code?.substring(0, 2).toLowerCase() : undefined,
      params.category === 'licenses' ? product.code : undefined
    );

    return {
      ...product,
      zenithPrice: pricingInfo.price,
      savingsBadge: pricingInfo.savingsBadge
    };
  });

  const CategoryIcon = category.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className={`py-16 md:py-24 bg-gradient-to-r ${category.color} text-white`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="mr-4 p-3 bg-white/20 rounded-xl">
              <CategoryIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">{category.title}</h1>
              <p className="text-xl mt-2 opacity-90">{category.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {category.title} Plans
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Professional-grade {params.category} solutions at disruptive prices. 
            Save significantly compared to traditional providers.
          </p>
        </div>

        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedProducts.map((product, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300 mt-2">
                        {product.description}
                      </CardDescription>
                    </div>
                    {product.savingsBadge && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900">
                        {product.savingsBadge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    {product.zenithPrice}<span className="text-sm font-normal text-slate-500 dark:text-slate-400">/year</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                    Add to Cart <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    Prices shown are final. No hidden fees.
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Loading Products...</div>
            <p className="text-slate-600 dark:text-slate-300">
              We're fetching the latest {params.category} options for you.
            </p>
          </div>
        )}
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Why Choose Our {category.title}?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Compare our offerings with traditional providers and see the difference.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="py-4 px-6 text-left text-slate-900 dark:text-slate-100 font-semibold">Feature</th>
                  <th className="py-4 px-6 text-center text-slate-900 dark:text-slate-100 font-semibold">OpsVantage</th>
                  <th className="py-4 px-6 text-center text-slate-900 dark:text-slate-100 font-semibold">Traditional Providers</th>
                  <th className="py-4 px-6 text-center text-slate-900 dark:text-slate-100 font-semibold">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <tr>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">Base Price</td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-bold">Low</td>
                  <td className="py-4 px-6 text-center text-slate-700 dark:text-slate-300">High</td>
                  <td className="py-4 px-6 text-center text-amber-600 dark:text-amber-400 font-bold">Significant</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">Setup Fees</td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-bold">None</td>
                  <td className="py-4 px-6 text-center text-red-600 dark:text-red-400">Common</td>
                  <td className="py-4 px-6 text-center text-amber-600 dark:text-amber-400 font-bold">$0-$50</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">Support</td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-bold">24/7</td>
                  <td className="py-4 px-6 text-center text-slate-700 dark:text-slate-300">Business Hours</td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300">Renewal Rates</td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400 font-bold">Consistent</td>
                  <td className="py-4 px-6 text-center text-red-600 dark:text-red-400">Increased</td>
                  <td className="py-4 px-6 text-center text-amber-600 dark:text-amber-400 font-bold">Up to 300%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about our {params.category} services.
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