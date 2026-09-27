export const PRINT_SIZES = [
  "8 × 10 in",
  "11 × 14 in",
  "12 × 18 in",
  "16 × 20 in",
  "18 × 24 in",
  "20 × 30 in",
  "24 × 32 in",
  "24 × 36 in",
] as const;

export type RequestedCheckoutItem = { id: string; size: string; quantity: number };

export function validateCheckoutRequest(countryValue: unknown, itemValue: unknown) {
  const country = String(countryValue || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new Error("Select a shipping destination.");
  if (!Array.isArray(itemValue) || itemValue.length < 1 || itemValue.length > 30) {
    throw new Error("Add 1–30 print variants to the cart.");
  }
  const items = itemValue as RequestedCheckoutItem[];
  const count = items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  const valid = items.every((item) =>
    typeof item?.id === "string"
    && item.id.length > 0
    && item.id.length <= 100
    && typeof item.size === "string"
    && PRINT_SIZES.includes(item.size as (typeof PRINT_SIZES)[number])
    && Number.isInteger(item.quantity)
    && item.quantity >= 1
    && item.quantity <= 50
  );
  if (!valid || count > 100) throw new Error("Invalid cart quantity or print size.");
  return { country, items, count };
}
