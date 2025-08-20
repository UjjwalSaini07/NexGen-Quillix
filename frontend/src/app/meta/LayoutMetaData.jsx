import React from "react";

const metadata = {
  viewport: "width=device-width, initial-scale=1.0",
  httpEquiv: "IE=edge",
  description:
    "NexGen-Quillix is an AI-powered content creation platform that crafts tailored, high-impact posts for LinkedIn, Instagram, X (Twitter), and more in seconds. Leveraging real-time trend analysis and customizable tone adaptation, it empowers marketers, entrepreneurs, and creators to boost engagement and streamline content workflows.",
  author: "UjjwalS",
  authorUrl: "https://www.ujjwalsaini.dev/",
  keywords:
    "NexGen-Quillix, AI content creation, social media posts, LinkedIn, Instagram, X, Twitter, trend analysis, content automation, Next.js, React.js, TypeScript, Python, TailwindCSS, Redis, Docker, GitHub Actions",
  ogTitle: "NexGen-Quillix: AI-Powered Content Creation",
  ogDescription:
    "Create platform-ready social media content instantly with NexGen-Quillix, an AI-driven tool tailored for marketers and creators, enhancing digital presence through smart automation and creative flexibility.",
  ogImage: "/NexGenQuillixLogo.png",
  ogUrl: "https://nexgenquillix.vercel.app/",
  ogType: "website",
  ogLocale: "en_US",
  ogSiteName: "NexGen-Quillix",
  twitterCard: "summary_large_image",
  twitterTitle: "NexGen-Quillix: AI-Powered Content Creation",
  twitterDescription:
    "Generate high-impact, trend-aware social media posts in seconds with NexGen-Quillix, combining intelligent AI automation with creative control for marketers and creators.",
  twitterImage: "/NexGenQuillixLogo.png",
  twitterSite: "@NexGenQuillix",
  twitterCreator: "@UjjwalSaini0007",
  canonical: "https://nexgenquillix.vercel.app/",
  robots: "index, follow",
  themeColor: "#",
  rating: "General",
  distribution: "Global",
  copyright: "NexGen-Quillix ©2025",
  applicationName: "NexGen-Quillix",
  appleMobileWebAppTitle: "NexGen-Quillix",
  appleMobileWebAppCapable: "yes",
};

// Author - UjjwalS - www.ujjwalsaini.dev
function LayoutMetaData({ children }) {
  React.useEffect(() => {
    document.title = metadata.ogTitle;

    function upsertMeta(attrName, attrValue, content) {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }

    // Basic Meta tags
    upsertMeta("name", "viewport", metadata.viewport);
    upsertMeta("http-equiv", "X-UA-Compatible", metadata.httpEquiv);
    upsertMeta("name", "description", metadata.description);
    upsertMeta("name", "author", metadata.author);
    upsertMeta("name", "keywords", metadata.keywords);
    upsertMeta("name", "robots", metadata.robots);
    upsertMeta("name", "theme-color", metadata.themeColor);
    upsertMeta("name", "rating", metadata.rating);
    upsertMeta("name", "distribution", metadata.distribution);
    upsertMeta("name", "copyright", metadata.copyright);
    upsertMeta("name", "application-name", metadata.applicationName);
    upsertMeta(
      "name",
      "apple-mobile-web-app-title",
      metadata.appleMobileWebAppTitle
    );
    upsertMeta(
      "name",
      "apple-mobile-web-app-capable",
      metadata.appleMobileWebAppCapable
    );

    // Open Graph
    upsertMeta("property", "og:title", metadata.ogTitle);
    upsertMeta("property", "og:description", metadata.ogDescription);
    upsertMeta("property", "og:image", metadata.ogImage);
    upsertMeta("property", "og:url", metadata.ogUrl);
    upsertMeta("property", "og:type", metadata.ogType);
    upsertMeta("property", "og:locale", metadata.ogLocale);
    upsertMeta("property", "og:site_name", metadata.ogSiteName);

    // Twitter Cards
    upsertMeta("name", "twitter:card", metadata.twitterCard);
    upsertMeta("name", "twitter:title", metadata.twitterTitle);
    upsertMeta("name", "twitter:description", metadata.twitterDescription);
    upsertMeta("name", "twitter:image", metadata.twitterImage);
    upsertMeta("name", "twitter:site", metadata.twitterSite);
    upsertMeta("name", "twitter:creator", metadata.twitterCreator);

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", metadata.canonical);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] bg-cover to-muted/80 p-2 py-10 flex flex-col justify-between">
      {children}
    </div>
  );
}

export default LayoutMetaData;
