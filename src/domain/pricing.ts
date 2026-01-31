import type { DistanceRange } from "../api/types";

export type PriceResult = {
  cartValue: number; // cents
  smallOrderSurcharge: number; // cents
  deliveryFee: number; // cents
  deliveryDistance: number; // meters
  totalPrice: number; // cents
};

export class DeliveryNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeliveryNotAvailableError";
  }
}

export function calculateSmallOrderSurcharge(
  cartCents: number,
  orderMinimumNoSurchargeCents: number
): number {
  return Math.max(0, orderMinimumNoSurchargeCents - cartCents);
}

function findDistanceRange(
  distanceRanges: DistanceRange[],
  distanceMeters: number
): DistanceRange {
  // distance_ranges sorted by min, last has max: 0
  for (const r of distanceRanges) {
    // max === 0 means NOT deliverable for distances >= min
    if (r.max === 0) {
      if (distanceMeters >= r.min) {
        throw new DeliveryNotAvailableError(
          `Delivery is not available for distance ${distanceMeters} m (limit starts at ${r.min} m).`
        );
      }
      continue;
    }

    if (distanceMeters >= r.min && distanceMeters < r.max) {
      return r;
    }
  }

  // Should not happen if API follows spec, but be safe
  throw new DeliveryNotAvailableError("Could not match distance range.");
}

export function calculateDeliveryFee(
  basePriceCents: number,
  distanceRanges: DistanceRange[],
  distanceMeters: number
): number {
  const r = findDistanceRange(distanceRanges, distanceMeters);

  // add b * distance / 10 (rounded to nearest integer)
  const distanceComponent = Math.round((r.b * distanceMeters) / 10);

  return basePriceCents + r.a + distanceComponent;
}

export function calculateTotalPrice(
  cartCents: number,
  smallOrderSurchargeCents: number,
  deliveryFeeCents: number
): number {
  return cartCents + smallOrderSurchargeCents + deliveryFeeCents;
}
