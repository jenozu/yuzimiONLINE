import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type PageMetaProps = {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "product";
};

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function PageMeta({ title, description, image, type = "website" }: PageMetaProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title.includes("yuzimiONLINE") ? title : `${title} | yuzimiONLINE`;
    const canonicalUrl = new URL(pathname, window.location.origin).toString();
    document.title = fullTitle;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", image ? "summary_large_image" : "summary");
    if (image) setMeta('meta[property="og:image"]', "property", "og:image", new URL(image, window.location.origin).toString());

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, image, pathname, title, type]);

  return null;
}

const ROUTE_META: Record<string, Omit<PageMetaProps, "image">> = {
  "/": {
    title: "Anime-Inspired Art Prints | yuzimiONLINE",
    description: "Shop made-to-order anime-inspired art prints in eight sizes with free shipping on United States orders.",
  },
  "/collections": {
    title: "Collection 001 — Cherry Blossoms",
    description: "Browse the Cherry Blossoms collection of made-to-order art prints from yuzimiONLINE.",
  },
  "/lookbook": {
    title: "Art Print Lookbook",
    description: "Explore the current yuzimiONLINE art-print collection in the visual lookbook.",
  },
  "/archive": {
    title: "Collection Archive",
    description: "View current and past yuzimiONLINE art-print collections.",
  },
  "/support": {
    title: "Shipping, Returns and FAQ",
    description: "Find yuzimiONLINE processing, shipping, print-care, returns, and contact information.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "Read the yuzimiONLINE privacy policy.",
  },
  "/terms": {
    title: "Terms of Service",
    description: "Read the yuzimiONLINE terms of service.",
  },
  "/security": {
    title: "Store Security",
    description: "Learn how yuzimiONLINE protects storefront and checkout activity.",
  },
};

export function RouteMeta() {
  const { pathname } = useLocation();
  const meta = ROUTE_META[pathname] ?? (pathname.startsWith("/product/")
    ? { title: "Art Print", description: "View print sizes, pricing, and details at yuzimiONLINE." }
    : { title: "yuzimiONLINE", description: "Made-to-order anime-inspired art prints." });
  return <PageMeta {...meta} />;
}
