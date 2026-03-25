import { defineNuxtModule } from '@nuxt/kit';

import { transformWikiLinks } from './transform';

export default defineNuxtModule({
  meta: { name: 'wiki-links', configKey: 'wikiLinks' },
  setup(_options, nuxt) {
    nuxt.hooks.hook('content:file:beforeParse', (ctx: { file: { id?: string; body: string } }) => {
      if (ctx.file?.id?.endsWith('.md') && typeof ctx.file.body === 'string') {
        ctx.file.body = transformWikiLinks(ctx.file.body);
      }
    });
  },
});
