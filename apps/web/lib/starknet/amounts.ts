/** Convert a user-facing decimal token amount into an integer 18-decimal amount. */
export function parseTokenAmount(value: string, decimals = 18): string {
  const normalized = value.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error("Invalid token amount");
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) throw new Error(`Amount supports at most ${decimals} decimals`);
  let scale = BigInt(1);
  for (let i = 0; i < decimals; i += 1) scale *= BigInt(10);
  return (BigInt(whole) * scale + BigInt((fraction + "0".repeat(decimals)).slice(0, decimals))).toString();
}
