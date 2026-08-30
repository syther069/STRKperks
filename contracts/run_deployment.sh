#!/bin/bash
set -euo pipefail

export PATH="/home/syther/.local/bin:$PATH"
export RPC_URL="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/alch_V90lFdPmF2bKD7C1HZ3Bj"
export ACCOUNT="strkperks-deployer"
export DEPLOYER_ADDRESS="0x018302fc803b8cce3b350d3ddfe6ff4c00061961ba15f826373b3cc798889054"

echo "=== Deploying Account ==="
DEPLOY_OUT=$(sncast account deploy --name $ACCOUNT --url $RPC_URL 2>&1 || true)
echo "$DEPLOY_OUT"
if echo "$DEPLOY_OUT" | grep -q "exceed balance (0)"; then
  echo "Account deployment failed due to zero balance. Please ensure the faucet transaction has cleared on Starknet Sepolia."
  exit 1
fi
if echo "$DEPLOY_OUT" | grep -q "error"; then
  if echo "$DEPLOY_OUT" | grep -q "already declared" || echo "$DEPLOY_OUT" | grep -q "already deployed" || echo "$DEPLOY_OUT" | grep -q "Transaction hash"; then
      echo "Account is already deployed or deploying."
  else
      echo "Account deployment encountered an error."
      exit 1
  fi
fi

extract_hex() {
  echo "$1" | grep -m 1 -oE '0x[0-9a-fA-F]{60,66}' || true
}

echo "=== Declaring Contracts ==="
declare_contract() {
  local contract=$1
  local out
  out=$(sncast --account $ACCOUNT declare --url $RPC_URL --contract-name $contract 2>&1 || true)
  echo "$out"
}

FACTORY_DEC=$(declare_contract "CampaignFactory")
NULLIFIER_DEC=$(declare_contract "NullifierRegistry")
ROUTER_DEC=$(declare_contract "RewardRouter")
CAMPAIGN_DEC=$(declare_contract "RewardCampaign")

FACTORY_HASH=$(extract_hex "$FACTORY_DEC")
NULLIFIER_HASH=$(extract_hex "$NULLIFIER_DEC")
ROUTER_HASH=$(extract_hex "$ROUTER_DEC")
CAMPAIGN_HASH=$(extract_hex "$CAMPAIGN_DEC")

echo "Factory Hash: $FACTORY_HASH"
echo "Nullifier Hash: $NULLIFIER_HASH"
echo "Router Hash: $ROUTER_HASH"
echo "Campaign Hash: $CAMPAIGN_HASH"

if [[ -z "$FACTORY_HASH" ]]; then
  echo "Declaration failed."
  exit 1
fi

echo "=== Deploying Contracts ==="
deploy_contract() {
  local out
  out=$(sncast --account $ACCOUNT deploy --url $RPC_URL "$@" 2>&1 || true)
  echo "$out"
}

echo "Deploying NullifierRegistry..."
NULLIFIER_DEP=$(deploy_contract --class-hash $NULLIFIER_HASH)
NULLIFIER_ADDR=$(extract_hex "$NULLIFIER_DEP")

echo "Deploying RewardRouter..."
ROUTER_DEP=$(deploy_contract --class-hash $ROUTER_HASH --constructor-calldata $DEPLOYER_ADDRESS)
ROUTER_ADDR=$(extract_hex "$ROUTER_DEP")

echo "Deploying CampaignFactory..."
FACTORY_DEP=$(deploy_contract --class-hash $FACTORY_HASH)
FACTORY_ADDR=$(extract_hex "$FACTORY_DEP")

echo "Deploying RewardCampaign..."
STRK_TOKEN="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
REWARD_AMOUNT="1000000000000000000"
MAX_CLAIMS="100"
START_TIME=$(date -d 'now' +%s)
END_TIME=$(date -d 'now + 30 days' +%s)

CAMPAIGN_DEP=$(deploy_contract --class-hash $CAMPAIGN_HASH --constructor-calldata $DEPLOYER_ADDRESS $STRK_TOKEN $REWARD_AMOUNT $MAX_CLAIMS $START_TIME $END_TIME)
CAMPAIGN_ADDR=$(extract_hex "$CAMPAIGN_DEP")

echo "Nullifier Address: $NULLIFIER_ADDR"
echo "Router Address: $ROUTER_ADDR"
echo "Factory Address: $FACTORY_ADDR"
echo "Campaign Address: $CAMPAIGN_ADDR"

echo "=== Post-Deployment Wiring ==="
echo "Authorizing Campaign in Router..."
sncast --account $ACCOUNT invoke --url $RPC_URL --contract-address $ROUTER_ADDR --function authorize_campaign --calldata $CAMPAIGN_ADDR

echo "Registering Campaign in Factory..."
sncast --account $ACCOUNT invoke --url $RPC_URL --contract-address $FACTORY_ADDR --function create_campaign --calldata $CAMPAIGN_ADDR

echo "=== Deployment Complete ==="
echo "NEXT_PUBLIC_NULLIFIER_REGISTRY_ADDRESS=$NULLIFIER_ADDR" > /tmp/deployed_addresses.txt
echo "NEXT_PUBLIC_REWARD_ROUTER_ADDRESS=$ROUTER_ADDR" >> /tmp/deployed_addresses.txt
echo "NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS=$FACTORY_ADDR" >> /tmp/deployed_addresses.txt
