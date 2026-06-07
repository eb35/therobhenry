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
        "connect-src 'self' https://cloudflareinsights.com",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://static.cloudflareinsights.com"],
        hashes: [
          "sha256-4zVaEKYnR18t8lqSvrDLj/1hLH54EA4pHoB3mSd2Bz8=",
          "sha256-mjyWuIypijg1Ajeng2q5VJbB81N1/AWlqiYEh4xL/8A=",
          "sha256-NEjEF2iM4lUXaXqTq3013V7f2Us9JtsgdAkagbZjm0S=",
        ],
      },
    },
  },

  adapter: cloudflare({
    // Bake optimized images at build for prerendered pages; use Cloudflare Images at runtime when needed
    imageService: { build: 'compile', runtime: 'cloudflare-binding' },
  }),
});