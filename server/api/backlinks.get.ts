import { queryCollection } from '@nuxt/content/server';
import { defineCachedEventHandler } from 'nitropack/runtime';

import { tryAsync } from '#shared/utils/tryCatch';

import { buildBacklinksIndex, type BacklinksIndex } from '../utils/backlinks';
import { handleApiError } from '../utils/handleApiError';

export default defineCachedEventHandler(
  async (event): Promise<BacklinksIndex> => {
    const [error, allContent] = await tryAsync(
      queryCollection(event, 'content').select('path', 'stem', 'title', 'type', 'body').all(),
    );

    if (error) {
      handleApiError(error, 'backlinks');
    }

    return buildBacklinksIndex(allContent);
  },
  {
    maxAge: 60 * 5,
    swr: true,
    name: 'backlinks',
  },
);
