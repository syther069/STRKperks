#!/usr/bin/env bash
set -euo pipefail

: "${RPC_URL:?Set RPC_URL to a trusted Starknet Sepolia endpoint}"
: "${ACCOUNT:?Set ACCOUNT to a configured, deployed sncast account name}"
: "${DEPLOYER_ADDRESS:?Set DEPLOYER_ADDRESS to the public owner address}"
: "${PRIVACY_POOL_ADDRESS:?Set PRIVACY_POOL_ADDRESS from a verified release}"
: "${REWARD_TOKEN_ADDRESS:?Set REWARD_TOKEN_ADDRESS to the supported ERC-20}"
: "${REWARD_TOKEN_DECIMALS:?Set REWARD_TOKEN_DECIMALS after verifying the ERC-20 metadata}"

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
command -v curl >/dev/null || { echo "curl is required" >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "Refusing to deploy from a dirty worktree. Commit the reviewed source first." >&2; exit 1; }
BUILD_TARGET="/tmp/strkperks-deploy-${PPID}-${RANDOM}-target"
export SCARB_TARGET_DIR="$BUILD_TARGET"
trap 'rm -rf -- "$BUILD_TARGET"' EXIT
NETWORK="${NETWORK:-sepolia}"
[[ "$NETWORK" == "sepolia" ]] || { echo "Only Sepolia is supported" >&2; exit 1; }
[[ "$REWARD_TOKEN_DECIMALS" == "18" ]] || { echo "The current web client supports only 18-decimal reward tokens" >&2; exit 1; }
[[ ! "$RPC_URL" =~ mainnet ]] || { echo "Refusing a mainnet RPC for Sepolia" >&2; exit 1; }
CHAIN_ID=$(curl -fsS -H 'content-type: application/json' --data '{"jsonrpc":"2.0","id":1,"method":"starknet_chainId","params":[]}' "$RPC_URL" | jq -er '.result')
[[ "${CHAIN_ID,,}" == "0x534e5f5345504f4c4941" ]] || { echo "RPC is not Starknet Sepolia: $CHAIN_ID" >&2; exit 1; }

REWARD_AMOUNT="${REWARD_AMOUNT:-1000000000000000000}"
MAX_CLAIMS="${MAX_CLAIMS:-100}"
START_TIME="${START_TIME:-$(date +%s)}"
END_TIME="${END_TIME:-$(date -d 'now + 30 days' +%s)}"
SALT="${SALT:-0x$(date +%s%N)}"
MANIFEST_PATH="${MANIFEST_PATH:-../deployments/sepolia/strkperks-$(date -u +%Y%m%dT%H%M%SZ).json}"

field() { jq -r "$2 // empty" <<<"$1"; }
declare_class() {
  local name="$1" output
  output=$(sncast --json --wait --account "$ACCOUNT" declare --url "$RPC_URL" --contract-name "$name")
  printf '%s' "$output"
}
deploy_class() {
  local output
  output=$(sncast --json --wait --account "$ACCOUNT" deploy --url "$RPC_URL" "$@")
  printf '%s' "$output"
}

scarb build
REGISTRY_DECL=$(declare_class NullifierRegistry)
CAMPAIGN_DECL=$(declare_class RewardCampaign)
ROUTER_DECL=$(declare_class RewardRouter)
FACTORY_DECL=$(declare_class CampaignFactory)
REGISTRY_CLASS=$(field "$REGISTRY_DECL" '.class_hash')
CAMPAIGN_CLASS=$(field "$CAMPAIGN_DECL" '.class_hash')
ROUTER_CLASS=$(field "$ROUTER_DECL" '.class_hash')
FACTORY_CLASS=$(field "$FACTORY_DECL" '.class_hash')
for value in "$REGISTRY_CLASS" "$CAMPAIGN_CLASS" "$ROUTER_CLASS" "$FACTORY_CLASS"; do [[ "$value" =~ ^0x[0-9a-fA-F]+$ ]] || { echo "Invalid class hash" >&2; exit 1; }; done

REGISTRY_DEPLOY=$(deploy_class --class-hash "$REGISTRY_CLASS")
REGISTRY_ADDRESS=$(field "$REGISTRY_DEPLOY" '.contract_address')
FACTORY_DEPLOY=$(deploy_class --class-hash "$FACTORY_CLASS" --constructor-calldata "$CAMPAIGN_CLASS" "$ROUTER_CLASS" "$REGISTRY_ADDRESS" "$PRIVACY_POOL_ADDRESS" "$REWARD_TOKEN_ADDRESS")
FACTORY_ADDRESS=$(field "$FACTORY_DEPLOY" '.contract_address')

CREATE_OUTPUT=$(sncast --json --wait --account "$ACCOUNT" invoke --url "$RPC_URL" --contract-address "$FACTORY_ADDRESS" --function create_campaign --calldata "$REWARD_AMOUNT" "$MAX_CLAIMS" "$START_TIME" "$END_TIME" "$SALT")
CREATE_TX=$(field "$CREATE_OUTPUT" '.transaction_hash')
RECEIPT=$(curl -fsS -H 'content-type: application/json' --data "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"starknet_getTransactionReceipt\",\"params\":[\"$CREATE_TX\"]}" "$RPC_URL")
CAMPAIGN_ADDRESS=$(jq -r --arg factory "$FACTORY_ADDRESS" '.result.events[] | select((.from_address|ascii_downcase)==($factory|ascii_downcase)) | .data[0]' <<<"$RECEIPT" | head -n1)
ROUTER_ADDRESS=$(jq -r --arg factory "$FACTORY_ADDRESS" '.result.events[] | select((.from_address|ascii_downcase)==($factory|ascii_downcase)) | .data[1]' <<<"$RECEIPT" | head -n1)
for value in "$REGISTRY_ADDRESS" "$FACTORY_ADDRESS" "$CAMPAIGN_ADDRESS" "$ROUTER_ADDRESS" "$CREATE_TX"; do [[ "$value" =~ ^0x[0-9a-fA-F]+$ ]] || { echo "Deployment evidence extraction failed" >&2; exit 1; }; done

mkdir -p "$(dirname "$MANIFEST_PATH")"
jq -n \
  --arg network "$NETWORK" --arg chainId "SN_SEPOLIA" --arg deployedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg gitCommit "$(git rev-parse HEAD)" \
  --arg scarbVersion "$(scarb --version | head -n1)" --arg sncastVersion "$(sncast --version | head -n1)" --arg explorerBaseUrl "https://sepolia.voyager.online" \
  --arg deployer "$DEPLOYER_ADDRESS" --arg pool "$PRIVACY_POOL_ADDRESS" --arg token "$REWARD_TOKEN_ADDRESS" --argjson tokenDecimals "$REWARD_TOKEN_DECIMALS" \
  --arg registryClass "$REGISTRY_CLASS" --arg campaignClass "$CAMPAIGN_CLASS" --arg routerClass "$ROUTER_CLASS" --arg factoryClass "$FACTORY_CLASS" \
  --arg registry "$REGISTRY_ADDRESS" --arg factory "$FACTORY_ADDRESS" --arg campaign "$CAMPAIGN_ADDRESS" --arg router "$ROUTER_ADDRESS" --arg createTx "$CREATE_TX" \
  --arg registryDeclareTx "$(field "$REGISTRY_DECL" '.transaction_hash')" --arg campaignDeclareTx "$(field "$CAMPAIGN_DECL" '.transaction_hash')" --arg routerDeclareTx "$(field "$ROUTER_DECL" '.transaction_hash')" --arg factoryDeclareTx "$(field "$FACTORY_DECL" '.transaction_hash')" \
  --arg registryDeployTx "$(field "$REGISTRY_DEPLOY" '.transaction_hash')" --arg factoryDeployTx "$(field "$FACTORY_DEPLOY" '.transaction_hash')" \
  --arg rewardAmount "$REWARD_AMOUNT" --arg maxClaims "$MAX_CLAIMS" --arg startTime "$START_TIME" --arg endTime "$END_TIME" --arg salt "$SALT" \
  '{schemaVersion:1,network:$network,chainId:$chainId,deployedAt:$deployedAt,gitCommit:$gitCommit,toolVersions:{scarb:$scarbVersion,sncast:$sncastVersion},explorerBaseUrl:$explorerBaseUrl,deployer:$deployer,privacyPool:$pool,rewardToken:$token,rewardTokenDecimals:$tokenDecimals,classHashes:{nullifierRegistry:$registryClass,campaignFactory:$factoryClass,rewardCampaign:$campaignClass,rewardRouter:$routerClass},addresses:{nullifierRegistry:$registry,campaignFactory:$factory,rewardCampaign:$campaign,rewardRouter:$router},constructorArguments:{nullifierRegistry:[],campaignFactory:[$campaignClass,$routerClass,$registry,$pool,$token],rewardCampaign:[$factory,$token,$registry,$rewardAmount,$maxClaims,$startTime,$endTime],rewardRouter:[$pool,$campaign,$token]},transactions:{declare:{nullifierRegistry:$registryDeclareTx,rewardCampaign:$campaignDeclareTx,rewardRouter:$routerDeclareTx,campaignFactory:$factoryDeclareTx},deploy:{nullifierRegistry:$registryDeployTx,campaignFactory:$factoryDeployTx},createCampaign:$createTx,wiring:$createTx},campaignConfig:{rewardAmount:$rewardAmount,maxClaims:$maxClaims,startTime:$startTime,endTime:$endTime,salt:$salt},verification:{status:"pending",verifiedAt:null,receipts:{}}}' > "$MANIFEST_PATH"

echo "Deployment submitted. Verify before enabling the web app: $MANIFEST_PATH"
