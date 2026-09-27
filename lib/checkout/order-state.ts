export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "fulfilled",
  "failed",
  "expired",
  "cancelled",
  "refunded",
  "partially_refunded",
  "disputed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["paid", "failed", "expired", "cancelled"],
  paid: ["processing", "cancelled", "partially_refunded", "refunded", "disputed"],
  processing: ["fulfilled", "cancelled", "partially_refunded", "refunded", "disputed"],
  fulfilled: ["partially_refunded", "refunded", "disputed"],
  failed: [],
  expired: [],
  cancelled: ["refunded"],
  refunded: [],
  partially_refunded: ["processing", "fulfilled", "refunded", "disputed"],
  disputed: ["paid", "refunded"],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return from === to || TRANSITIONS[from].includes(to);
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrder(from, to)) throw new Error(`Order cannot move from ${from} to ${to}.`);
}
