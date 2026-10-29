import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({site:'https://gyeongdongmkt.com',output:'static',integrations:[sitemap({filter:page=>!/https:\/\/gyeongdongmkt\.com\/(privacy|terms|cookies|404)\//.test(page)})],vite:{plugins:[tailwindcss()]}});
