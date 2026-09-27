export type PricedLine = { price_cents: number; quantity: number };

export function subtotalCents(lines: readonly PricedLine[]) {
  const subtotal = lines.reduce((sum, line) => {
    if (!Number.isSafeInteger(line.price_cents) || line.price_cents < 0 || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Invalid money line.");
    }
    return sum + line.price_cents * line.quantity;
  }, 0);
  if (!Number.isSafeInteger(subtotal)) throw new Error("Cart subtotal is too large.");
  return subtotal;
}

export function totalCents(subtotal: number, shipping: number) {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0 || !Number.isSafeInteger(shipping) || shipping < 0) throw new Error("Invalid cart total.");
  const total = subtotal + shipping;
  if (!Number.isSafeInteger(total) || total > 99_999_999) throw new Error("Cart total is invalid.");
  return total;
}
