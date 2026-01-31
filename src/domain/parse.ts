export class InputParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputParseError";
  }
}

// Spec: optional decimal separator '.', no thousand separators
export function parseEuroToCents(input: string): number {
  const s = input.trim();
  if (!s) throw new InputParseError("Cart value is required.");

  // allow digits + optional ".digits"
  if (!/^\d+(\.\d{1,2})?$/.test(s)) {
    throw new InputParseError("Cart value must be like 10 or 10.55");
  }

  const [eurosStr, centsStr = ""] = s.split(".");
  const euros = Number(eurosStr);
  const cents = Number((centsStr + "00").slice(0, 2)); // pad to 2

  const total = euros * 100 + cents;
  if (!Number.isFinite(total) || total < 0) throw new InputParseError("Invalid cart value.");
  return total;
}

export function parseNumberField(input: string, fieldName: string): number {
  const s = input.trim();
  if (!s) throw new InputParseError(`${fieldName} is required.`);

  const n = Number(s);
  if (!Number.isFinite(n)) throw new InputParseError(`${fieldName} must be a number.`);
  return n;
}
