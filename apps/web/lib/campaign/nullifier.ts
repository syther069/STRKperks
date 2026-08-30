import { hash } from "starknet";

const DOMAIN_SEPARATOR = "strkperks:nullifier:v1";

export function toFelt(value: string): string {
  // Starknet's canonical short input hash gives arbitrary strings a stable felt
  // representation without putting the raw secret in a transaction payload.
  return /^0x[0-9a-f]+$/i.test(value)
    ? value
    : `0x${hash.starknetKeccak(value).toString(16)}`;
}

/** Nullifier = Poseidon(domain, campaign namespace, claimant secret). */
export function deriveNullifier(
  namespace: string,
  secretOrConversion: string,
  domainSeparator = DOMAIN_SEPARATOR
): string {
  return hash.computePoseidonHashOnElements([
    toFelt(domainSeparator),
    toFelt(namespace),
    toFelt(secretOrConversion),
  ]);
}

/**
 * Derives a recipient commitment from their secret without revealing their public address.
 * Commitment = Hash(recipientSecret, salt)
 */
export function deriveRecipientCommitment(recipientSecret: string): string {
  return hash.computePoseidonHashOnElements([
    toFelt("strkperks:recipient-commitment:v1"),
    toFelt(recipientSecret),
  ]);
}
