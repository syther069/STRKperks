#!/usr/bin/env bash
set -euo pipefail
: "${RPC_URL:?Set RPC_URL to the Starknet Sepolia endpoint used for verification}"
MANIFEST="${1:?Usage: ./verify_deployment.sh ../deployments/sepolia/<manifest>.json}"
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$(realpath "$MANIFEST")"
cd "$SCRIPT_DIR"
BUILD_TARGET="/tmp/strkperks-manifest-verify-${PPID}-${RANDOM}-target"
export SCARB_TARGET_DIR="$BUILD_TARGET"
trap 'rm -rf -- "$BUILD_TARGET"' EXIT

rpc() { curl -fsS -H 'content-type: application/json' --data "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$1\",\"params\":$2}" "$RPC_URL"; }
normalize() { printf '%s' "$1" | tr 'A-F' 'a-f' | sed -E 's/^0x0*/0x/; s/^0x$/0x0/'; }
assert_equal() { [[ "$(normalize "$1")" == "$(normalize "$2")" ]] || { echo "$3 mismatch: $1 != $2" >&2; exit 1; }; }
manifest() { jq -r "$1" "$MANIFEST"; }
call() {
  local address="$1" selector="$2" calldata="${3:-[]}" response
  response=$(rpc starknet_call "[{\"contract_address\":\"$address\",\"entry_point_selector\":\"$selector\",\"calldata\":$calldata},\"latest\"]")
  jq -er '.result[0]' <<<"$response"
}

CHAIN=$(rpc starknet_chainId '[]' | jq -er '.result')
assert_equal "$CHAIN" 0x534e5f5345504f4c4941 "chain id"
for key in nullifierRegistry campaignFactory rewardCampaign rewardRouter; do
  address=$(manifest ".addresses.$key")
  expected=$(manifest ".classHashes.$key")
  actual=$(rpc starknet_getClassHashAt "[\"latest\",\"$address\"]" | jq -er '.result')
  assert_equal "$actual" "$expected" "$key class hash"
done

# Rebuild and recompute class hashes so the manifest is tied to checked-out source.
[[ "$(git rev-parse HEAD)" == "$(manifest '.gitCommit')" ]] || { echo "Manifest git commit does not match HEAD" >&2; exit 1; }
scarb build >/dev/null
local_class_hash() { sncast utils class-hash --contract-name "$1" | grep -oE '0x[0-9a-fA-F]+' | head -n1; }
assert_equal "$(local_class_hash NullifierRegistry)" "$(manifest '.classHashes.nullifierRegistry')" "NullifierRegistry source class hash"
assert_equal "$(local_class_hash CampaignFactory)" "$(manifest '.classHashes.campaignFactory')" "CampaignFactory source class hash"
assert_equal "$(local_class_hash RewardCampaign)" "$(manifest '.classHashes.rewardCampaign')" "RewardCampaign source class hash"
assert_equal "$(local_class_hash RewardRouter)" "$(manifest '.classHashes.rewardRouter')" "RewardRouter source class hash"

# Selectors are computed by sncast to avoid hard-coded selector drift.
selector() { sncast utils selector "$1" | grep -oE '0x[0-9a-fA-F]+' | head -n1; }
campaign=$(manifest '.addresses.rewardCampaign'); router=$(manifest '.addresses.rewardRouter'); factory=$(manifest '.addresses.campaignFactory')
assert_equal "$(call "$campaign" "$(selector get_owner)")" "$(manifest '.deployer')" "campaign owner"
assert_equal "$(call "$campaign" "$(selector get_reward_token)")" "$(manifest '.rewardToken')" "campaign token"
assert_equal "$(call "$campaign" "$(selector get_nullifier_registry)")" "$(manifest '.addresses.nullifierRegistry')" "campaign registry"
assert_equal "$(call "$campaign" "$(selector get_anonymizer)")" "$router" "campaign router"
assert_equal "$(call "$router" "$(selector get_pool)")" "$(manifest '.privacyPool')" "router pool"
assert_equal "$(call "$router" "$(selector get_campaign)")" "$campaign" "router campaign"
assert_equal "$(call "$router" "$(selector get_reward_token)")" "$(manifest '.rewardToken')" "router token"
assert_equal "$(call "$(manifest '.rewardToken')" "$(selector decimals)")" 0x12 "reward token decimals"
assert_equal "$(call "$factory" "$(selector get_campaign_class_hash)")" "$(manifest '.classHashes.rewardCampaign')" "factory campaign class"
assert_equal "$(call "$factory" "$(selector get_router_class_hash)")" "$(manifest '.classHashes.rewardRouter')" "factory router class"
assert_equal "$(call "$factory" "$(selector get_registry)")" "$(manifest '.addresses.nullifierRegistry')" "factory registry"
assert_equal "$(call "$factory" "$(selector get_pool)")" "$(manifest '.privacyPool')" "factory pool"
assert_equal "$(call "$factory" "$(selector get_reward_token)")" "$(manifest '.rewardToken')" "factory token"
assert_equal "$(call "$factory" "$(selector get_campaign)" '["0x0"]')" "$campaign" "factory campaign index"
assert_equal "$(call "$factory" "$(selector get_router)" '["0x0"]')" "$router" "factory router index"

count=$(call "$factory" "$(selector get_campaign_count)")
(( 16#${count#0x} > 0 )) || { echo "Factory contains no campaigns" >&2; exit 1; }

# Every recorded transaction must have succeeded and reached an accepted block.
receipt_evidence='{}'
while IFS=$'\t' read -r label hash; do
  receipt=$(rpc starknet_getTransactionReceipt "[\"$hash\"]")
  finality=$(jq -er '.result.finality_status' <<<"$receipt")
  execution=$(jq -er '.result.execution_status' <<<"$receipt")
  [[ "$finality" =~ ^ACCEPTED_ON_ ]] || { echo "$label is not accepted: $finality" >&2; exit 1; }
  [[ "$execution" == "SUCCEEDED" ]] || { echo "$label did not succeed: $execution" >&2; exit 1; }
  block=$(jq -er '.result.block_number' <<<"$receipt")
  receipt_evidence=$(jq --arg key "$label" --arg hash "$hash" --arg finality "$finality" --arg execution "$execution" --argjson block "$block" '. + {($key): {transactionHash:$hash,finalityStatus:$finality,executionStatus:$execution,blockNumber:$block}}' <<<"$receipt_evidence")
done < <(jq -r '.transactions | paths(scalars) as $path | [($path | map(tostring) | join(".")), getpath($path)] | @tsv' "$MANIFEST")

tmp="${MANIFEST}.verified.tmp"
jq --arg verifiedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson receipts "$receipt_evidence" '.verification={status:"verified",verifiedAt:$verifiedAt,receipts:$receipts}' "$MANIFEST" > "$tmp"
mv "$tmp" "$MANIFEST"
echo "Verified deployment manifest: $MANIFEST"
