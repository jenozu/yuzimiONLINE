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
        const body = await response.json().catch(() => null) as ProductsResponse | { error?: string } | null;
        if (!response.ok) throw new Error(body && "error" in body ? body.error : "Could not load the catalog.");
        setProducts((body as ProductsResponse).products || []);
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
