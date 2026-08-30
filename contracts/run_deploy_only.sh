#!/bin/bash
set -euo pipefail

export PATH="/home/syther/.local/bin:$PATH"
export RPC_URL="https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/alch_V90lFdPmF2bKD7C1HZ3Bj"
export ACCOUNT="strkperks-deployer"
export DEPLOYER_ADDRESS="0x018302fc803b8cce3b350d3ddfe6ff4c00061961ba15f826373b3cc798889054"

# Hardcoded class hashes from previous declare attempts
FACTORY_HASH="0x03c379781f8536a707c5804a89b2b4eac268237a97c2068ce584a9391ed0a3a1"
NULLIFIER_HASH="0x0231614ff8e30d40e2175adbf57fd8e3c7dd3f431142db03f2c2acdd94c8b88d"
ROUTER_HASH="0x7a1f321e040e305858b990a67099aa1cf970f4bc9387d1d25c0a267c6515d85"
CAMPAIGN_HASH="0x01bf43112f74c05cd60de919ae961ff9217c5a1f30fe77e9bd0c057cde715159"

echo "=== Deploying NullifierRegistry ==="
NULL_OUT=$(sncast --wait --account $ACCOUNT deploy --url $RPC_URL --class-hash $NULLIFIER_HASH 2>&1 || true)
echo "$NULL_OUT"
NULL_ADDR=$(echo "$NULL_OUT" | grep -o 'contract_address: 0x[0-9a-fA-F]*' | awk '{print $2}' || true)

echo "=== Deploying RewardRouter ==="
ROUTER_OUT=$(sncast --wait --account $ACCOUNT deploy --url $RPC_URL --class-hash $ROUTER_HASH --constructor-calldata $DEPLOYER_ADDRESS 2>&1 || true)
echo "$ROUTER_OUT"
ROUTER_ADDR=$(echo "$ROUTER_OUT" | grep -o 'contract_address: 0x[0-9a-fA-F]*' | awk '{print $2}' || true)

echo "=== Deploying CampaignFactory ==="
FACT_OUT=$(sncast --wait --account $ACCOUNT deploy --url $RPC_URL --class-hash $FACTORY_HASH 2>&1 || true)
echo "$FACT_OUT"
FACTORY_ADDR=$(echo "$FACT_OUT" | grep -o 'contract_address: 0x[0-9a-fA-F]*' | awk '{print $2}' || true)

echo "=== Deploying RewardCampaign ==="
STRK_TOKEN="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
REWARD_AMOUNT="1000000000000000000"
MAX_CLAIMS="100"
START_TIME=$(date -d 'now' +%s)
END_TIME=$(date -d 'now + 30 days' +%s)

CAMP_OUT=$(sncast --wait --account $ACCOUNT deploy --url $RPC_URL --class-hash $CAMPAIGN_HASH --constructor-calldata $DEPLOYER_ADDRESS $STRK_TOKEN $REWARD_AMOUNT $MAX_CLAIMS $START_TIME $END_TIME 2>&1 || true)
echo "$CAMP_OUT"
CAMPAIGN_ADDR=$(echo "$CAMP_OUT" | grep -o 'contract_address: 0x[0-9a-fA-F]*' | awk '{print $2}' || true)

echo "NULLIFIER_ADDR=$NULL_ADDR"
echo "ROUTER_ADDR=$ROUTER_ADDR"
echo "FACTORY_ADDR=$FACTORY_ADDR"
echo "CAMPAIGN_ADDR=$CAMPAIGN_ADDR"

echo "=== Post-Deployment Wiring ==="
sncast --wait --account $ACCOUNT invoke --url $RPC_URL --contract-address $ROUTER_ADDR --function authorize_campaign --calldata $CAMPAIGN_ADDR 2>&1 || true
sncast --wait --account $ACCOUNT invoke --url $RPC_URL --contract-address $FACTORY_ADDR --function create_campaign --calldata $CAMPAIGN_ADDR 2>&1 || true

echo "=== Done ==="
