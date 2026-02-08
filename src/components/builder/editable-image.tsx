'use client'

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EditableImageProps {
  src: string;
  alt: string;
  className?: string;
  onUpdate: (newSrc: string) => void;
  prompt?: string;
}

/**
 * 👁️ VISUAL CORTEX: AI-powered image editor component
 * Features:
 * - AI Generated images (placeholder integration)
 * - File upload support
 * - Hover controls
 * - Holographic border effect
 */
export function EditableImage({
  src,
  alt,
  className,
  onUpdate,
  prompt = 'Generate a futuristic tech image',
}: EditableImageProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // AI IMAGE GENERATION
  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      // TODO: Integrate with real API (DALL-E 3, Midjourney, Recraft)
      // For now, use placeholder images from Unsplash
      const placeholders = [
        'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618005182384-a83a8e46fe67?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1633356122544-f134324ef6db?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1639762681033-6461e5b49fab?q=80&w=1600&auto=format&fit=crop',
      ];

      // Simulate API call
      await new Promise((r) => setTimeout(r, 2000));

      // Pick a random placeholder
      const randomImage = placeholders[Math.floor(Math.random() * placeholders.length)];
      onUpdate(randomImage);

      console.log('[MARZ] Generated visual cortex update:', prompt);
    } catch (error) {
      console.error('[MARZ] Image generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // FILE UPLOAD HANDLER
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // TODO: Integrate with Cloudinary or your storage service
      const formData = new FormData();
      formData.append('file', file);

      // For now, create a local blob URL (not production-ready)
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdate(result);
        console.log('[MARZ] Image uploaded to visual cortex');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[MARZ] Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn('relative group overflow-hidden rounded-lg', className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* THE IMAGE */}
      <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={cn(
              'object-cover transition-all duration-500',
              isHovering ? 'scale-105 blur-[2px]' : 'scale-100'
            )}
          />
        ) : (
          <div className="text-slate-400 text-sm">No image</div>
        )}
      </div>

      {/* OVERLAY CONTROLS */}
      {isHovering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2 z-20"
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAiGenerate}
            disabled={isGenerating || isUploading}
            className="gap-2"
            whileTap={{ scale: 0.95 }}
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 text-cyan-400" />
            )}
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </Button>

          <label className="cursor-pointer inline-block">
            <div
              className={cn(
                'inline-flex items-center justify-center rounded-xl font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 h-9 px-4 text-[10px] bg-transparent text-white border border-white/20 hover:border-white/40 gap-2',
                isUploading ? 'opacity-50 pointer-events-none' : ''
              )}
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </motion.div>
      )}

      {/* HOLOGRAPHIC BORDER */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/50 pointer-events-none transition-colors z-10 rounded-lg" />
    </div>
  );
}
