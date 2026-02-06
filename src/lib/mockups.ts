/**
 * Defines the structure for a single mockup's configuration.
 */
export interface MockupConfig {
  path: string;
  screen: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

/**
 * A record of all available mockup configurations.
 * The keys (e.g., 'macbook-front') will be used as the `mockupType` in the API request.
 */
export const MOCKUP_CONFIGS: Record<string, MockupConfig> = {
  'macbook-front': {
    path: './public/mockups/macbook-front.png',
    screen: {
      width: 1440,
      height: 900,
      x: 240,
      y: 108,
    },
  },
  'iphone-angled': {
    path: './public/mockups/iphone-angled.png',
    screen: {
      width: 375,
      height: 812,
      x: 45,
      y: 90,
    },
  },
  'browser-window': {
    path: './public/mockups/browser-window.png',
    screen: {
      width: 1160,
      height: 700,
      x: 20,
      y: 80,
    },
  },
  'ipad-portrait': {
    path: './public/mockups/ipad-portrait.png',
    screen: {
      width: 1024,
      height: 1366,
      x: 50,
      y: 100,
    },
  },
  'iphone-front': {
    path: './public/mockups/iphone-front.png',
    screen: {
      width: 430,
      height: 932,
      x: 20,
      y: 50,
    },
  },
};