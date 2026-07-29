// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://therobhenry.com',
  integrations: [mdx(), sitemap()],

  fonts: [
      {
          provider: fontProviders.local(),
          name: 'Atkinson',
          cssVariable: '--font-atkinson',
          fallbacks: ['sans-serif'],
          options: {
              variants: [
                  {
                      src: ['./src/assets/fonts/atkinson-regular.woff'],
                      weight: 400,
                      style: 'normal',
                      display: 'swap',
                  },
                  {
                      src: ['./src/assets/fonts/atkinson-bold.woff'],
                      weight: 700,
                      style: 'normal',
                      display: 'swap',
                  },
              ],
          },
      },
    ],

  vite: {
    plugins: [tailwindcss()],
  },

  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        // Fixed nonce: Cloudflare JavaScript Detections injects a rotating inline
        // script and stamps this nonce from the CSP *HTTP* header onto it.
        // Site scripts still rely on Astro-generated hashes; this only unblocks CF.
        resources: ["'self'", "'nonce-therobhenry-cfjsd'"],
      },
    },
  },

  adapter: cloudflare({
    // Bake optimized images at build for prerendered pages; use Cloudflare Images at runtime when needed
    imageService: { build: 'compile', runtime: 'cloudflare-binding' },
  }),
});