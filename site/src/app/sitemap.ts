import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { adresseSite, cheminLocalise, versionsLangues, type PagePublique } from "@/lib/site";

const pages: PagePublique[] = ["/", "/evaluation"];

export default function sitemap(): MetadataRoute.Sitemap {
  const absolue = (chemin: string) => new URL(chemin, adresseSite()).toString();
  return pages.map((page) => ({
    url: absolue(cheminLocalise(page, routing.defaultLocale)),
    changeFrequency: page === "/" ? "weekly" : "monthly",
    priority: page === "/" ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(Object.entries(versionsLangues(page)).map(([langue, chemin]) => [langue, absolue(chemin)])),
    },
  }));
}
