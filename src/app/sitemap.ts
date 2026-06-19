import { demos } from "@/data";
import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/constants";

const latestUpdate = demos
  .map((d) => d.added)
  .filter((d) => !!d)
  .sort()
  .at(-1);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_ORIGIN;
  return [
    {
      url: baseUrl,
      lastModified: latestUpdate,
      changeFrequency: "daily",
      priority: 1,
    },
    ...demos.map((d) => ({
      url: `${baseUrl}/${d.id}`,
      lastModified: d.added,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
