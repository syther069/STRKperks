use core::traits::TryInto;
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_block_timestamp,
    start_cheat_caller_address, stop_cheat_block_timestamp, stop_cheat_caller_address,
};
use starknet::ContractAddress;
use strkperks_contracts::nullifier_registry::INullifierRegistryDispatcher;
use strkperks_contracts::reward_campaign::{
    IRewardCampaignDispatcher, IRewardCampaignDispatcherTrait,
};
use strkperks_contracts::test_token::{ITestTokenDispatcher, ITestTokenDispatcherTrait};

fn owner_addr() -> ContractAddress { 0x1111.try_into().unwrap() }
fn pool_addr() -> ContractAddress { 0x2222.try_into().unwrap() }
fn user_addr() -> ContractAddress { 0x3333.try_into().unwrap() }
fn anonymizer_addr() -> ContractAddress { 0x4444.try_into().unwrap() }

fn deploy_registry() -> INullifierRegistryDispatcher {
    let class = declare("NullifierRegistry").unwrap().contract_class();
    let (addr, _) = class.deploy(@array![]).unwrap();
    INullifierRegistryDispatcher { contract_address: addr }
}

fn deploy_token() -> ITestTokenDispatcher {
    let class = declare("TestToken").unwrap().contract_class();
    let owner: felt252 = owner_addr().into();
    let (addr, _) = class.deploy(@array![owner, 10_000, 0]).unwrap();
    ITestTokenDispatcher { contract_address: addr }
}

fn deploy_campaign(
    token: ContractAddress, registry: ContractAddress,
) -> IRewardCampaignDispatcher {
    let class = declare("RewardCampaign").unwrap().contract_class();
    let owner: felt252 = owner_addr().into();
    let token_felt: felt252 = token.into();
    let registry_felt: felt252 = registry.into();
    let (addr, _) = class
        .deploy(@array![owner, token_felt, registry_felt, 50, 10, 100, 1_000])
        .unwrap();
    IRewardCampaignDispatcher { contract_address: addr }
}

fn fund_campaign(token: ITestTokenDispatcher, campaign: IRewardCampaignDispatcher) {
    start_cheat_caller_address(token.contract_address, owner_addr());
    token.approve(campaign.contract_address, 500);
    stop_cheat_caller_address(token.contract_address);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.fund_with_erc20(500);
    stop_cheat_caller_address(campaign.contract_address);
}

#[test]
fn test_funding_is_backed_by_real_tokens() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    fund_campaign(token, campaign);
    assert(campaign.get_budget() == 500, 'budget should match funding');
    assert(token.balance_of(campaign.contract_address) == 500, 'campaign must hold tokens');
}

#[test]
fn test_anonymizer_can_only_be_configured_once() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(anonymizer_addr());
    stop_cheat_caller_address(campaign.contract_address);
    assert(campaign.get_anonymizer() == anonymizer_addr(), 'anonymizer configured');
}

#[test]
#[should_panic(expected: 'ANONYMIZER_ALREADY_SET')]
fn test_anonymizer_reconfiguration_reverts() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(anonymizer_addr());
    campaign.configure_anonymizer(pool_addr());
    stop_cheat_caller_address(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'CALLER_NOT_ANONYMIZER')]
fn test_direct_claim_reverts() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(anonymizer_addr());
    stop_cheat_caller_address(campaign.contract_address);
    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, user_addr());
    campaign.claim_reward(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'CLAIM_NOT_APPROVED')]
fn test_approval_is_bound_to_exact_note() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    fund_campaign(token, campaign);
    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(anonymizer_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    start_cheat_caller_address(campaign.contract_address, anonymizer_addr());
    campaign.claim_reward(0xA, 0xB, 0xD, 900);
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'NOT_AUTHORIZED')]
fn test_non_owner_cannot_approve_claim() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, user_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'INVALID_EXPIRY')]
fn test_approval_expiry_must_be_in_the_future() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 200);
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'INSUFFICIENT_BUDGET')]
fn test_claim_rejects_when_budget_is_insufficient() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(anonymizer_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    start_cheat_caller_address(campaign.contract_address, anonymizer_addr());
    campaign.claim_reward(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'CAMPAIGN_EXPIRED')]
fn test_expired_campaign_rejects_claim() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    fund_campaign(token, campaign);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(anonymizer_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    start_cheat_block_timestamp(campaign.contract_address, 1_001);
    start_cheat_caller_address(campaign.contract_address, anonymizer_addr());
    campaign.claim_reward(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'CAMPAIGN_PAUSED')]
fn test_paused_campaign_rejects_claim() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    fund_campaign(token, campaign);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(anonymizer_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    campaign.pause();
    stop_cheat_caller_address(campaign.contract_address);
    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, anonymizer_addr());
    campaign.claim_reward(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
fn test_owner_can_withdraw_only_after_close() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    fund_campaign(token, campaign);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.close();
    campaign.withdraw_unspent(owner_addr(), 200);
    stop_cheat_caller_address(campaign.contract_address);
    assert(campaign.get_budget() == 300, 'budget reduced by withdrawal');
    assert(token.balance_of(owner_addr()) == 9_700, 'tokens returned to owner');
}
