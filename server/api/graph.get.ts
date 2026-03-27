import { defineCachedEventHandler } from "nitropack/runtime";
import { queryCollection } from "@nuxt/content/server";
import { buildGraphFromContent } from "../utils/graph";
import type { GraphData } from "#shared/types/graph";
import { tryAsync } from "#shared/utils/tryCatch";
import { handleApiError } from "../utils/handleApiError";

export default defineCachedEventHandler(
  async (event): Promise<GraphData> => {
    const [error, allContent] = await tryAsync(
      queryCollection(event, "content")
        .select("path", "stem", "title", "type", "tags", "authors", "summary", "body")
        .all(),
    );

    if (error) {
      handleApiError(error, "graph");
    }

    return buildGraphFromContent(allContent);
  },
  {
    maxAge: 60 * 5,
    swr: true,
    name: "graph",
  },
);
