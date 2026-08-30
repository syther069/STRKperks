import { deriveNullifier, deriveRecipientCommitment, toFelt } from "../lib/campaign/nullifier";
import { generatePrivateRewardNote } from "../lib/strk20/notes";
import { campaignFormSchema } from "../lib/validation/campaignSchema";
import { parseTokenAmount } from "../lib/starknet/amounts";

// Simple standalone assertion test suite that can be run directly via node / tsx or vitest
function runTests() {
  console.log("Starting StrkPerks Protocol Tests...\n");

  // Test 1: Deterministic Nullifier Generation
  const ns = "strk_ambassador_q1";
  const convId = "conv_test_100";
  const null1 = deriveNullifier(ns, convId);
  const null2 = deriveNullifier(ns, convId);
  if (null1 !== null2) {
    throw new Error("FAIL: Nullifiers must be deterministic for identical parameters");
  }
  if (!/^0x[0-9a-f]+$/i.test(null1)) {
    throw new Error("FAIL: Nullifier must be a valid felt252 hex format");
  }
  console.log("✓ Test 1 Passed: Deterministic Nullifier derivation verified.");

  // Test 2: Cross-namespace Isolation
  const nullDifferentNs = deriveNullifier("strk_ambassador_q2", convId);
  if (null1 === nullDifferentNs) {
    throw new Error("FAIL: Nullifiers must be unique across different namespaces");
  }
  console.log("✓ Test 2 Passed: Campaign namespace replay isolation verified.");

  // Test 2b: Secret binding
  const nullDifferentSecret = deriveNullifier(ns, "different-secret");
  if (null1 === nullDifferentSecret) {
    throw new Error("FAIL: Nullifiers must bind to the claimant secret");
  }
  console.log("✓ Test 2b Passed: Nullifiers bind to claimant secrets.");

  // Test 3: Recipient Commitment Derivation
  const secret = "recipient_test_key_8849";
  const commitment = deriveRecipientCommitment(secret);
  if (!/^0x[0-9a-f]+$/i.test(commitment) || commitment.length < 30) {
    throw new Error("FAIL: Recipient commitment must be a valid hash");
  }
  console.log("✓ Test 3 Passed: Recipient commitment hashing verified.");

  // Test 4: Private Reward Note Generation
  const note = generatePrivateRewardNote("camp_test_1", "50.0", commitment);
  if (!note.noteHash || note.amountSTRK !== "50.0" || note.isSpent) {
    throw new Error("FAIL: Private note structure invalid");
  }
  console.log("✓ Test 4 Passed: STRK20 private note generation verified.");

  // Test 5: Zod Campaign Validation
  const validData = {
    name: "Starknet Ambassador Campaign",
    description: "Valid campaign description for referral rewards",
    rewardAmount: "25.0",
    maxClaims: "100",
    durationDays: "30",
    nullifierNamespace: "strk_valid_ns",
  };
  const validRes = campaignFormSchema.safeParse(validData);
  if (!validRes.success) {
    throw new Error(`FAIL: Valid campaign rejected: ${JSON.stringify(validRes.error)}`);
  }

  const invalidData = {
    ...validData,
    rewardAmount: "-10", // Invalid negative amount
  };
  const invalidRes = campaignFormSchema.safeParse(invalidData);
  if (invalidRes.success) {
    throw new Error("FAIL: Negative reward amount should be rejected by Zod schema");
  }
  console.log("✓ Test 5 Passed: Zod form validation rules verified.");

  if (parseTokenAmount("1.5") !== "1500000000000000000") {
    throw new Error("FAIL: Token amount conversion is incorrect");
  }
  console.log("✓ Test 6 Passed: Token amount conversion verified.");

  if (!/^0x[0-9a-f]+$/i.test(toFelt("conv_human_readable_100"))) {
    throw new Error("FAIL: Human-readable conversion IDs must encode as felts");
  }
  console.log("✓ Test 7 Passed: Conversion ID felt encoding verified.");

  console.log("\nAll 7 StrkPerks Protocol Checks Passed Successfully!");
}

runTests();
