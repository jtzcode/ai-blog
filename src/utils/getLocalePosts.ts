import { getCollection } from "astro:content";
import type { SiteLocale } from "@/config";

export async function getLocalePosts(lang: SiteLocale) {
  const posts = await getCollection(
    "blog",
    ({ data }) => !data.draft && data.lang === lang
  );

  return posts.sort(
    (a, b) => b.data.pubDatetime.valueOf() - a.data.pubDatetime.valueOf()
  );
}
