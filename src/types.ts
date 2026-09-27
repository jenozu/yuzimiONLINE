export interface ProductVariant {
  size: string;
  price_cents: number;
  price: number;
  position: number;
  available?: boolean;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  badge?: string;
  additionalImages?: string[];
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}
