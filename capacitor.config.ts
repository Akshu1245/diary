import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mydiary.securejournal',
  appName: 'MyDiary',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
