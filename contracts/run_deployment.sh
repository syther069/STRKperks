#!/usr/bin/env bash
set -euo pipefail

: "${RPC_URL:?Set RPC_URL to a trusted Starknet RPC endpoint}"
: "${NETWORK:=sepolia}"
: "${ACCOUNT:?Set ACCOUNT to a configured, deployed sncast account name}"
: "${DEPLOYER_ADDRESS:?Set DEPLOYER_ADDRESS to the campaign owner address}"
: "${PRIVACY_POOL_ADDRESS:?Set PRIVACY_POOL_ADDRESS from the current official privacy release}"
: "${REWARD_TOKEN_ADDRESS:?Set REWARD_TOKEN_ADDRESS to the ERC-20 reward token}"

if [[ "$NETWORK" != "sepolia" ]]; then
  echo "Only Sepolia is supported by this deployment script; set NETWORK=sepolia." >&2
  exit 1
fi
if [[ "$RPC_URL" =~ mainnet ]]; then
  echo "Refusing a Sepolia deployment against a mainnet RPC URL." >&2
  exit 1
fi

REWARD_AMOUNT="${REWARD_AMOUNT:-1000000000000000000}"
MAX_CLAIMS="${MAX_CLAIMS:-100}"
START_TIME="${START_TIME:-$(date +%s)}"
END_TIME="${END_TIME:-$(date -d 'now + 30 days' +%s)}"

extract_hex() {
  echo "$1" | grep -m 1 -oE '0x[0-9a-fA-F]{60,66}' || true
}

declare_contract() {
  local contract="$1"
  local output
  output=$(sncast --account "$ACCOUNT" declare --url "$RPC_URL" --contract-name "$contract")
  echo "$output" >&2
  extract_hex "$output"
}

deploy_contract() {
  local output
  output=$(sncast --wait --account "$ACCOUNT" deploy --url "$RPC_URL" "$@")
  echo "$output" >&2
  extract_hex "$output"
}

echo "Building and declaring the current contract sources"
scarb build
NULLIFIER_HASH=$(declare_contract "NullifierRegistry")
FACTORY_HASH=$(declare_contract "CampaignFactory")
CAMPAIGN_HASH=$(declare_contract "RewardCampaign")
ROUTER_HASH=$(declare_contract "RewardRouter")

for required_hash in "$NULLIFIER_HASH" "$FACTORY_HASH" "$CAMPAIGN_HASH" "$ROUTER_HASH"; do
  if [[ -z "$required_hash" ]]; then
    echo "Could not extract a declared class hash; stop before deploying." >&2
    exit 1
  fi
done

echo "Deploying registry, factory, campaign, and anonymizer"
NULLIFIER_ADDR=$(deploy_contract --class-hash "$NULLIFIER_HASH")
FACTORY_ADDR=$(deploy_contract --class-hash "$FACTORY_HASH")
CAMPAIGN_ADDR=$(deploy_contract \
  --class-hash "$CAMPAIGN_HASH" \
  --constructor-calldata \
  "$DEPLOYER_ADDRESS" "$REWARD_TOKEN_ADDRESS" "$NULLIFIER_ADDR" \
  "$REWARD_AMOUNT" "$MAX_CLAIMS" "$START_TIME" "$END_TIME")
ROUTER_ADDR=$(deploy_contract \
  --class-hash "$ROUTER_HASH" \
  --constructor-calldata "$PRIVACY_POOL_ADDRESS" "$CAMPAIGN_ADDR" "$REWARD_TOKEN_ADDRESS")

if [[ -z "$NULLIFIER_ADDR" || -z "$FACTORY_ADDR" || -z "$CAMPAIGN_ADDR" || -z "$ROUTER_ADDR" ]]; then
  echo "Could not extract every deployed address; stop before post-deployment wiring." >&2
  exit 1
fi

echo "Applying one-time campaign wiring"
sncast --wait --account "$ACCOUNT" invoke --url "$RPC_URL" \
  --contract-address "$CAMPAIGN_ADDR" --function configure_anonymizer --calldata "$ROUTER_ADDR"
sncast --wait --account "$ACCOUNT" invoke --url "$RPC_URL" \
  --contract-address "$FACTORY_ADDR" --function create_campaign --calldata "$CAMPAIGN_ADDR"

printf '%s\n' \
  "NEXT_PUBLIC_NULLIFIER_REGISTRY_ADDRESS=$NULLIFIER_ADDR" \
  "NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=$FACTORY_ADDR" \
  "NEXT_PUBLIC_REWARD_CAMPAIGN_ADDRESS=$CAMPAIGN_ADDR" \
  "NEXT_PUBLIC_REWARD_ROUTER_ADDRESS=$ROUTER_ADDR" \
  "NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=$REWARD_TOKEN_ADDRESS" \
  "NEXT_PUBLIC_STRK20_PRIVACY_POOL_ADDRESS=$PRIVACY_POOL_ADDRESS" \
  "NULLIFIER_REGISTRY_CLASS_HASH=$NULLIFIER_HASH" \
  "CAMPAIGN_FACTORY_CLASS_HASH=$FACTORY_HASH" \
  "REWARD_CAMPAIGN_CLASS_HASH=$CAMPAIGN_HASH" \
  "REWARD_ROUTER_CLASS_HASH=$ROUTER_HASH" \
  > deployed_addresses.env

echo "Deployment complete. Verify every address before enabling live mode; output: contracts/deployed_addresses.env"
