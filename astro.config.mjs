import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({site:'https://gyeongdongmkt.com',output:'static',integrations:[sitemap({filter:page=>page==='https://gyeongdongmkt.com/'})],vite:{plugins:[tailwindcss()]}});
