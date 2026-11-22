import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const SITE = {
  name: "ACLC College of Mandaue",
  title: "Technical Assets Management System",
  description:
    "Track equipment from the shelf to the classroom and back, with RFID check-out, live loan status and a full audit trail.",
  image: "/og-image.png", // 1200×630, source in scripts/og
  imageAlt: "Technical Assets Management System by ACLC College of Mandaue.",
};

/**
 * Link-preview tags (Open Graph + Twitter) so a shared link shows a title, description and thumbnail.
 * Chat apps and social sites read the raw HTML and need an absolute image URL, which comes from VITE_SITE_URL.
 */
function socialPreview(siteUrl: string | undefined): Plugin {
  const base = siteUrl?.replace(/\/+$/, "");
  const image = base ? `${base}${SITE.image}` : SITE.image;
  const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: "meta", attrs, injectTo: "head" });

  return {
    name: "social-preview",
    configResolved(config) {
      if (!base && config.command === "build") {
        config.logger.warn("[social-preview] VITE_SITE_URL is not set: shared links may show no thumbnail.");
      }
    },
    transformIndexHtml: () => [
      meta({ name: "description", content: SITE.description }),
      meta({ name: "theme-color", content: "#1e3a8a" }),
      meta({ property: "og:type", content: "website" }),
      meta({ property: "og:site_name", content: SITE.name }),
      meta({ property: "og:title", content: SITE.title }),
      meta({ property: "og:description", content: SITE.description }),
      ...(base ? [meta({ property: "og:url", content: `${base}/` })] : []),
      meta({ property: "og:image", content: image }),
      meta({ property: "og:image:type", content: "image/png" }),
      meta({ property: "og:image:width", content: "1200" }),
      meta({ property: "og:image:height", content: "630" }),
      meta({ property: "og:image:alt", content: SITE.imageAlt }),
      meta({ name: "twitter:card", content: "summary_large_image" }),
      meta({ name: "twitter:title", content: SITE.title }),
      meta({ name: "twitter:description", content: SITE.description }),
      meta({ name: "twitter:image", content: image }),
      meta({ name: "twitter:image:alt", content: SITE.imageAlt }),
    ],
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [react(), tailwindcss(), socialPreview(env.VITE_SITE_URL)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
