'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoSave } from '@/hooks/use-auto-save';
import { loadProjectContentAction } from '@/app/actions/save-project';
import { getCurrentSubscriptionAction } from '@/app/actions/billing';
import { publishSiteAction } from '@/app/actions/publish-site';
import { EditableImage } from '@/components/builder/editable-image';
import { EditableText } from '@/components/builder/editable-text';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Save,
  Eye,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Default structure for new projects
const DEFAULT_SITE_DATA = {
  siteConfig: {
    title: 'My AI-Generated Website',
    description: 'Built with MARZ AI Builder',
    theme: 'futuristic',
  },
  pages: [
    {
      id: 'home',
      name: 'Home',
      sections: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            headline: 'Welcome to Your AI Site',
            subheadline: 'Built with the power of generative AI',
            ctaText: 'Get Started',
            ctaLink: '#features',
            image:
              'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1600&auto=format&fit=crop',
          },
        },
        {
          id: 'features-1',
          type: 'features',
          content: {
            headline: 'Key Features',
            items: [
              {
                title: 'AI-Powered',
                description: 'Generated entirely by artificial intelligence',
                icon: '⚡',
              },
              {
                title: 'Fully Editable',
                description: 'Edit any element in real-time',
                icon: '✏️',
              },
              {
                title: 'Auto-Saving',
                description: 'Your changes are automatically saved',
                icon: '💾',
              },
            ],
          },
        },
      ],
    },
  ],
};

interface BuilderPageProps {
  params: { projectId: string };
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const router = useRouter();
  const [siteData, setSiteData] = useState(DEFAULT_SITE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 1. LOAD EXISTING PROJECT DATA ON MOUNT
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const result = await loadProjectContentAction(params.projectId);

        if (result.success && result.content) {
          setSiteData(result.content as typeof DEFAULT_SITE_DATA);
          console.log('[MARZ] Engram loaded from long-term memory');
        } else if (result.error) {
          // If no saved data, use default
          console.log('[MARZ] Starting fresh Engram, using default structure');
        }
      } catch (error) {
        console.error('[MARZ] Failed to load project:', error);
        setLoadError('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [params.projectId]);

  // 2. LOAD SUBSCRIPTION STATUS
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const result = await getCurrentSubscriptionAction();
        if (result.success) {
          setSubscription(result.subscription);
        }
      } catch (error) {
        console.error('[MARZ] Failed to load subscription:', error);
      }
    };

    loadSubscription();
  }, []);

  // 3. ACTIVATE AUTO-SAVE
  const { status, lastSaved, error: saveError } = useAutoSave(
    params.projectId,
    siteData,
    { debounceMs: 2000 }
  );

  // HANDLERS
  const handlePublish = async () => {
    try {
      // Check if user has active subscription
      if (!subscription || subscription.status !== 'active') {
        setShowUpgradeModal(true);
        return;
      }

      // Check usage limits
      if (subscription.usage.sites.used >= subscription.usage.sites.limit) {
        alert(
          `You've reached your site limit for the ${subscription.plan} plan. Upgrade to publish more sites.`
        );
        router.push('/dashboard/billing');
        return;
      }

      setIsPublishing(true);
      const result = await publishSiteAction(params.projectId);

      if (result.success) {
        alert(
          `Website published! Visit: ${result.url}`
        );
        window.open(result.url, '_blank');
      } else {
        alert(`Publish failed: ${result.error}`);
      }
    } catch (error) {
      console.error('[MARZ] Publish error:', error);
      alert('Failed to publish website');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateSection = (
    pageId: string,
    sectionId: string,
    field: string,
    value: any
  ) => {
    setSiteData((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      content: {
                        ...section.content,
                        [field]: value,
                      },
                    }
                  : section
              ),
            }
          : page
      ),
    }) as any);
  };

  const handleUpdateSiteConfig = (field: string, value: string) => {
    setSiteData((prev) => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        [field]: value,
      },
    }) as any);
  };

  const currentPage = siteData.pages.find((p) => p.id === selectedPage);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-cyan-500"
        >
          <Loader2 className="w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* LEFT SIDEBAR: Navigation */}
      <aside className="w-64 border-r border-cyan-500/20 bg-slate-900/50 backdrop-blur overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* SITE CONFIG */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Site Config
            </h2>
            <EditableText
              value={siteData.siteConfig.title}
              onSave={(val) => handleUpdateSiteConfig('title', val)}
              className="text-white text-sm font-bold hover:text-cyan-300"
            />
          </div>

          {/* PAGE NAVIGATION */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Pages
            </h3>
            <div className="space-y-1">
              {siteData.pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded transition-colors text-sm',
                    selectedPage === page.id
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  )}
                >
                  {page.name}
                </button>
              ))}
            </div>
          </div>

          {/* SAVE STATUS */}
          <div className="pt-4 border-t border-slate-700">
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Save Status</p>
              <div className="flex items-center gap-2">
                {status === 'saving' && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span className="text-xs text-blue-400">Syncing...</span>
                  </>
                )}
                {status === 'saved' && (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-400">Synced</span>
                  </>
                )}
                {status === 'unsaved' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-xs text-yellow-500">Unsaved</span>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">Error</span>
                  </>
                )}
              </div>
              {lastSaved && (
                <p className="text-[10px] text-slate-500">
                  Last: {lastSaved.toLocaleTimeString()}
                </p>
              )}
              {saveError && (
                <p className="text-[10px] text-red-400">{saveError}</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN EDITOR */}
      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <div className="border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {siteData.siteConfig.title}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {currentPage?.name || 'Home'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={handlePublish}
                disabled={isPublishing || !subscription || subscription.status !== 'active'}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : !subscription || subscription.status !== 'active' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Upgrade to Publish
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* SECTION EDITOR */}
        <div className="p-8 space-y-8 max-w-5xl">
          {currentPage?.sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-6 rounded-lg border-2 transition-all',
                selectedSection === section.id
                  ? 'border-cyan-500 bg-slate-900/80'
                  : 'border-slate-700 hover:border-cyan-500/50 bg-slate-900/50'
              )}
              onClick={() => setSelectedSection(section.id)}
            >
              {/* SECTION TYPE BADGE */}
              <div className="mb-4">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-1 rounded">
                  {section.type}
                </span>
              </div>

              {/* HERO SECTION EDITOR */}
              {section.type === 'hero' && (
                <div className="space-y-4">
                  {/* HERO IMAGE */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold mb-2 block">
                      Hero Image
                    </label>
                    <EditableImage
                      src={section.content.image || 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1600&auto=format&fit=crop'}
                      alt="Hero image"
                      className="h-64 w-full rounded-lg"
                      onUpdate={(newSrc) =>
                        handleUpdateSection(
                          currentPage!.id,
                          section.id,
                          'image',
                          newSrc
                        )
                      }
                      prompt={section.content.headline}
                    />
                  </div>

                  {/* HERO TEXT */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold mb-2 block">
                      Headline
                    </label>
                    <EditableText
                      value={section.content.headline || ''}
                      onSave={(val) =>
                        handleUpdateSection(
                          currentPage!.id,
                          section.id,
                          'headline',
                          val
                        )
                      }
                      className="text-3xl font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold mb-2 block">
                      Subheadline
                    </label>
                    <EditableText
                      value={section.content.subheadline || ''}
                      onSave={(val) =>
                        handleUpdateSection(
                          currentPage!.id,
                          section.id,
                          'subheadline',
                          val
                        )
                      }
                      className="text-lg text-slate-300"
                    />
                  </div>
                </div>
              )}

              {/* FEATURES SECTION EDITOR */}
              {section.type === 'features' && (
                <div className="space-y-4">
                  <EditableText
                    value={section.content.headline || ''}
                    onSave={(val) =>
                      handleUpdateSection(
                        currentPage!.id,
                        section.id,
                        'headline',
                        val
                      )
                    }
                    className="text-2xl font-bold text-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    {(section.content.items || []).map(
                      (item: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <EditableText
                            value={item.title || ''}
                            onSave={(val) => {
                              const newItems = [...(section.content.items || [])];
                              newItems[idx].title = val;
                              handleUpdateSection(
                                currentPage!.id,
                                section.id,
                                'items',
                                newItems
                              );
                            }}
                            className="font-bold text-white"
                          />
                          <EditableText
                            value={item.description || ''}
                            onSave={(val) => {
                              const newItems = [...(section.content.items || [])];
                              newItems[idx].description = val;
                              handleUpdateSection(
                                currentPage!.id,
                                section.id,
                                'items',
                                newItems
                              );
                            }}
                            className="text-sm text-slate-300"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* ADD SECTION BUTTON */}
          <button className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-slate-700 rounded-lg hover:border-cyan-500/50 transition-colors text-slate-400 hover:text-cyan-400">
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      </main>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border-2 border-cyan-500/30 rounded-lg p-8 max-w-md mx-4"
          >
            <div className="text-center">
              <Lock className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Upgrade Required
              </h2>
              <p className="text-slate-400 mb-6">
                Publishing is only available with an active subscription. Choose a plan to get started.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowUpgradeModal(false);
                    router.push('/dashboard/billing');
                  }}
                  className="flex-1"
                >
                  Choose Plan
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
