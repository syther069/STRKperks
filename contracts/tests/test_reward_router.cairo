use core::traits::TryInto;
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_block_timestamp,
    start_cheat_caller_address, stop_cheat_block_timestamp, stop_cheat_caller_address,
};
use starknet::ContractAddress;
use strkperks_contracts::nullifier_registry::{
    INullifierRegistryDispatcher, INullifierRegistryDispatcherTrait,
};
use strkperks_contracts::reward_campaign::{
    IRewardCampaignDispatcher, IRewardCampaignDispatcherTrait,
};
use strkperks_contracts::reward_router::{IRewardRouterDispatcher, IRewardRouterDispatcherTrait};
use strkperks_contracts::test_token::{ITestTokenDispatcher, ITestTokenDispatcherTrait};

fn owner_addr() -> ContractAddress { 0x1111.try_into().unwrap() }
fn pool_addr() -> ContractAddress { 0x2222.try_into().unwrap() }
fn stranger_addr() -> ContractAddress { 0x3333.try_into().unwrap() }

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

fn deploy_router(
    campaign: ContractAddress, token: ContractAddress,
) -> IRewardRouterDispatcher {
    let class = declare("RewardRouter").unwrap().contract_class();
    let pool: felt252 = pool_addr().into();
    let campaign_felt: felt252 = campaign.into();
    let token_felt: felt252 = token.into();
    let (addr, _) = class.deploy(@array![pool, campaign_felt, token_felt]).unwrap();
    IRewardRouterDispatcher { contract_address: addr }
}

fn configure_and_fund(
    token: ITestTokenDispatcher,
    campaign: IRewardCampaignDispatcher,
    router: IRewardRouterDispatcher,
) {
    start_cheat_caller_address(token.contract_address, owner_addr());
    token.approve(campaign.contract_address, 500);
    stop_cheat_caller_address(token.contract_address);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.configure_anonymizer(router.contract_address);
    campaign.fund_with_erc20(500);
    stop_cheat_caller_address(campaign.contract_address);
}

#[test]
fn test_private_invoke_releases_exact_reward_and_approves_pool() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    let router = deploy_router(campaign.contract_address, token.contract_address);
    configure_and_fund(token, campaign, router);

    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);

    start_cheat_caller_address(router.contract_address, pool_addr());
    let deposits = router.privacy_invoke(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(router.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);

    assert(deposits.len() == 1, 'one open note deposit');
    assert(campaign.get_budget() == 450, 'budget decremented');
    assert(registry.is_nullifier_used(campaign.contract_address, 0xB), 'nullifier consumed');
    assert(token.balance_of(router.contract_address) == 50, 'router received reward');
    assert(token.allowance(router.contract_address, pool_addr()) == 50, 'pool approved');
}

#[test]
fn test_private_invoke_credits_only_the_balance_delta() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    let router = deploy_router(campaign.contract_address, token.contract_address);
    configure_and_fund(token, campaign, router);

    // Pre-existing router funds must never be swept into the claimant's open note.
    start_cheat_caller_address(token.contract_address, owner_addr());
    token.mint(router.contract_address, 7);
    stop_cheat_caller_address(token.contract_address);

    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(campaign.contract_address);

    start_cheat_caller_address(router.contract_address, pool_addr());
    let deposits = router.privacy_invoke(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(router.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);

    let deposit = deposits.at(0);
    assert(*deposit.amount == 50, 'credit only reward delta');
    assert(token.balance_of(router.contract_address) == 57, 'dust remains separate');
    assert(token.allowance(router.contract_address, pool_addr()) == 50, 'approve only delta');
}

#[test]
#[should_panic(expected: 'CALLER_NOT_PRIVACY')]
fn test_non_pool_cannot_invoke_router() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    let router = deploy_router(campaign.contract_address, token.contract_address);
    start_cheat_caller_address(router.contract_address, stranger_addr());
    router.privacy_invoke(0xA, 0xB, 0xC, 900);
    stop_cheat_caller_address(router.contract_address);
}

#[test]
#[should_panic(expected: 'NULLIFIER_USED')]
fn test_same_nullifier_cannot_fund_a_second_note() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    let router = deploy_router(campaign.contract_address, token.contract_address);
    configure_and_fund(token, campaign, router);

    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    campaign.approve_claim(0xE, 0xB, 0xD, 900);
    stop_cheat_caller_address(campaign.contract_address);
    start_cheat_caller_address(router.contract_address, pool_addr());
    router.privacy_invoke(0xA, 0xB, 0xC, 900);
    router.privacy_invoke(0xE, 0xB, 0xD, 900);
    stop_cheat_caller_address(router.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'CONVERSION_ALREADY_CLAIMED')]
fn test_same_conversion_cannot_fund_a_second_note_with_new_nullifier() {
    let registry = deploy_registry();
    let token = deploy_token();
    let campaign = deploy_campaign(token.contract_address, registry.contract_address);
    let router = deploy_router(campaign.contract_address, token.contract_address);
    configure_and_fund(token, campaign, router);

    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.approve_claim(0xA, 0xB, 0xC, 900);
    campaign.approve_claim(0xA, 0xD, 0xE, 900);
    stop_cheat_caller_address(campaign.contract_address);
    start_cheat_caller_address(router.contract_address, pool_addr());
    router.privacy_invoke(0xA, 0xB, 0xC, 900);
    router.privacy_invoke(0xA, 0xD, 0xE, 900);
    stop_cheat_caller_address(router.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);
}
