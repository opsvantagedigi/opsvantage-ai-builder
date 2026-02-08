'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionContent {
  headline?: string;
  subheadline?: string;
  image?: string;
  cta?: string;
  ctaLink?: string;
  items?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  [key: string]: any;
}

interface Section {
  id: string;
  type: string;
  content: SectionContent;
}

interface RenderEngineProps {
  sections: Section[];
  onUpdate?: (sectionId: string, field: string, value: string) => void;
}

/**
 * 👁️ RENDER ENGINE: Transforms JSON project structure into a live website
 *
 * Features:
 * - Hero sections with images and CTAs
 * - Features grid
 * - Testimonials
 * - Custom sections
 * - Responsive design
 * - Animation on scroll
 */
export function RenderEngine({
  sections,
  onUpdate,
}: RenderEngineProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* RENDER ALL SECTIONS */}
      {sections.map((section) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* HERO SECTION */}
          {section.type === 'HERO' && (
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
              {/* Background Image */}
              {section.content.image && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={section.content.image}
                    alt="Hero background"
                    fill
                    className="object-cover opacity-40"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 container mx-auto px-6 text-center text-white max-w-4xl">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-6xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300"
                >
                  {section.content.headline || 'Welcome'}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                  {section.content.subheadline ||
                    'Built with the power of AI'}
                </motion.p>

                {section.content.cta && (
                  <motion.a
                    href={section.content.ctaLink || '#'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors shadow-xl hover:shadow-2xl"
                  >
                    {section.content.cta}
                  </motion.a>
                )}
              </div>

              {/* Scroll Indicator */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </motion.div>
            </section>
          )}

          {/* FEATURES SECTION */}
          {section.type === 'FEATURES' && (
            <section className="py-20 px-6 bg-slate-50">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-5xl font-black mb-4 text-center text-slate-900">
                  {section.content.headline || 'Features'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                  {section.content.items?.map(
                    (item: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                      >
                        {item.icon && (
                          <div className="text-4xl mb-4">{item.icon}</div>
                        )}
                        <h3 className="text-xl font-bold mb-2 text-slate-900">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TESTIMONIALS SECTION */}
          {section.type === 'TESTIMONIALS' && (
            <section className="py-20 px-6 bg-white">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-5xl font-black mb-16 text-center text-slate-900">
                  {section.content.headline || 'What People Say'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {section.content.items?.map(
                    (item: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className="p-8 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl text-slate-300">"</div>
                          <div>
                            <p className="text-slate-700 mb-4">
                              {item.description}
                            </p>
                            <p className="font-bold text-slate-900">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* FAQ SECTION */}
          {section.type === 'FAQ' && (
            <section className="py-20 px-6 bg-slate-50">
              <div className="container mx-auto max-w-3xl">
                <h2 className="text-5xl font-black mb-16 text-center text-slate-900">
                  {section.content.headline || 'FAQs'}
                </h2>

                <div className="space-y-4">
                  {section.content.items?.map(
                    (item: any, idx: number) => (
                      <FAQItem
                        key={idx}
                        question={item.title}
                        answer={item.description}
                        index={idx}
                      />
                    )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* FOOTER/CUSTOM SECTION */}
          {section.type === 'FOOTER' && (
            <section className="py-16 px-6 bg-slate-900 text-white">
              <div className="container mx-auto text-center">
                <p className="text-slate-400 mb-4">
                  © 2024 Built with OpsVantage AI Builder
                </p>
                <p className="text-slate-500 text-sm">
                  Powered by MARZ Neural Architecture
                </p>
              </div>
            </section>
          )}

          {/* CUSTOM SECTION - Fallback */}
          {section.type === 'CUSTOM' && (
            <section className="py-20 px-6 bg-white border-t border-slate-200">
              <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-center mb-8">
                  {section.content.headline || 'Custom Section'}
                </h2>
                <p className="text-center text-gray-600">
                  {section.content.description ||
                    'This is a custom section. Edit in the builder.'}
                </p>
              </div>
            </section>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * FAQ Item Component with accordion behavior
 */
function FAQItem(
  {
    question,
    answer,
    index,
  }: {
    question: string;
    answer: string;
    index: number;
  }
) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left font-semibold text-slate-900 bg-white hover:bg-slate-50 transition-colors flex justify-between items-center"
      >
        <span>{question}</span>
        <svg
          className={cn(
            'w-5 h-5 text-slate-600 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden border-t border-slate-200"
      >
        <p className="p-6 text-slate-600 bg-slate-50">{answer}</p>
      </motion.div>
    </motion.div>
  );
}
