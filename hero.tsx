import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@/components/builder/editable-text';

interface HeroContent {
  headline?: string;
  subhead?: string;
  cta?: string;
}

interface HeroSectionProps {
  content: HeroContent;
  onUpdate: (field: keyof HeroContent, value: string) => void;
}

// Moved to src/components/builder/sections/hero.tsx