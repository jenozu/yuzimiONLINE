import { useEffect, useState } from "react";
import type { Product } from "../types";

type ProductsResponse = { products: Product[] };

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products", { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "Could not load the catalog.";
          throw new Error(message);
        }
        if (!body || typeof body !== "object" || !("products" in body) || !Array.isArray(body.products)) {
          throw new Error("Catalog API returned an invalid response. Check Vercel routing for /api/products.");
        }
        setProducts((body as ProductsResponse).products);
      })
      .catch((caught) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Could not load the catalog.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { products, loading, error };
}
