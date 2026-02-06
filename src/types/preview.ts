export interface FeatureItem {
  title: string
  description: string
  icon?: string
  imageSuggestions?: string[]
}

export interface FeaturesContent {
  headline: string
  items?: FeatureItem[]
}

export interface FooterContent {
  text?: string
}

export type DefaultContent = Record<string, unknown>
