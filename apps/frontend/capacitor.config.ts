import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trendyx.ecom',
  appName: 'TicariTakas',
  webDir: '.output/public',
  ios: {
    allowsLinkPreview: true,
    contentInset: 'automatic',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
