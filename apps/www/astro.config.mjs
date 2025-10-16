// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from "@astrojs/sitemap";
import robotsTxt from 'astro-robots-txt';

export default defineConfig({
  site: 'https://vanx.chat/',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ko'],  // Add 'ko' here
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [react(), sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en-US',
        es: 'es-ES',
        ko: 'ko-KR'  // Add Korean
      }
    }
  }),
  robotsTxt()
  ],
  vite: {
    plugins: [
      tailwindcss()
    ],
    server: {
      watch: {
        usePolling: true
      }
    }
  }
});
