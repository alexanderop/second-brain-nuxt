import { getQuery } from "h3";
import { defineCachedEventHandler } from "nitropack/runtime";
import { queryCollection, queryCollectionSearchSections } from "@nuxt/content/server";
import { findUnlinkedMentions, type MentionItem } from "../utils/mentions";
import { tryCatchAsync } from "#shared/utils/tryCatch";
import { handleApiError } from "../utils/handleApiError";

export default defineCachedEventHandler(
  async (event): Promise<MentionItem[]> => {
    const query = getQuery(event);
    const targetSlug = String(query.slug || "");
    const targetTitle = String(query.title || "");

    if (!targetSlug || !targetTitle || targetTitle.length < 3) {
      return [];
    }

    const [error, result] = await tryCatchAsync(async () => {
      const allContent = await queryCollection(event, "content").all();
      const searchSections = await queryCollectionSearchSections(event, "content");
      return findUnlinkedMentions(allContent, searchSections, targetSlug, targetTitle);
    });

    if (error) {
      handleApiError(error, "mentions");
    }

    return result;
  },
  {
    maxAge: 60 * 5,
    swr: true,
    name: "mentions",
  },
);
