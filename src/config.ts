export const SITE = {
  website: "https://jtzcode.github.io/ai-blog/",
  author: "jtzcode",
  profile: "https://github.com/jtzcode",
  desc: "Notes on software, AI, and systems in English and 中文.",
  title: "概念的价值",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Suggest changes",
    url: "",
  },
  dynamicOgImage: false,
  dir: "ltr",
  lang: "en",
  timezone: "Asia/Shanghai",
} as const;

export const LOCALES = [
  { code: "en", label: "EN", href: "/en/" },
  { code: "zh", label: "中文", href: "/zh/" },
] as const;

export type SiteLocale = (typeof LOCALES)[number]["code"];
