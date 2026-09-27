// Keep these rates in sync with the destination selector in CartDrawer.
// Prices are USD cents: first item, each additional item.
export const SHIPPING_RATES: Record<string, [number, number]> = {
  US: [0, 0], CA: [999, 250], GB: [1089, 529],
  AT: [1089, 529], BE: [1089, 529], FR: [1089, 529],
  DE: [1089, 529], IE: [1089, 529], IT: [1089, 529],
  NL: [1089, 529], ES: [1089, 529], SE: [1089, 529],
  CH: [1839, 539], NO: [1839, 539], DK: [1839, 539],
  FI: [1839, 539], IS: [1839, 539], LI: [1839, 539],
  LV: [1439, 539], LT: [1439, 539], EE: [1439, 539],
};

export function shippingCents(country: string, quantity: number): number {
  const rate = SHIPPING_RATES[country];
  if (!rate || !Number.isInteger(quantity) || quantity < 1) throw new Error('Unsupported shipping destination or quantity.');
  return rate[0] + (quantity - 1) * rate[1];
}

