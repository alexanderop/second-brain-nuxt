import { queryCollection } from '@nuxt/content/server';
import { defineCachedEventHandler } from 'nitropack/runtime';

import { tryAsync } from '#shared/utils/tryCatch';

import { buildGraphFromContent, type GraphData } from '../utils/graph';
import { handleApiError } from '../utils/handleApiError';

export default defineCachedEventHandler(
  async (event): Promise<GraphData> => {
    const [error, allContent] = await tryAsync(
      queryCollection(event, 'content')
        .select('path', 'stem', 'title', 'type', 'tags', 'authors', 'summary', 'body')
        .all(),
    );

    if (error) {
      handleApiError(error, 'graph');
    }

    return buildGraphFromContent(allContent);
  },
  {
    maxAge: 60 * 5,
    swr: true,
    name: 'graph',
  },
);
