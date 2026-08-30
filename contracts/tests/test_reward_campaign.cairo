use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address, start_cheat_block_timestamp, stop_cheat_block_timestamp};
use starknet::ContractAddress;
use core::traits::TryInto;
use strkperks_contracts::reward_campaign::{IRewardCampaignDispatcher, IRewardCampaignDispatcherTrait};
use strkperks_contracts::nullifier_registry::{INullifierRegistryDispatcher, INullifierRegistryDispatcherTrait};
use strkperks_contracts::reward_router::{IRewardRouterDispatcher, IRewardRouterDispatcherTrait};

fn owner_addr() -> ContractAddress { 0x1111.try_into().unwrap() }
fn token_addr() -> ContractAddress { 0x2222.try_into().unwrap() }
fn user_addr() -> ContractAddress { 0x3333.try_into().unwrap() }

fn deploy_campaign(start: u64, end: u64, reward: u128, max_claims: u32) -> IRewardCampaignDispatcher {
    let class = declare("RewardCampaign").unwrap().contract_class();
    let owner_felt: felt252 = owner_addr().into();
    let token_felt: felt252 = token_addr().into();
    let reward_felt: felt252 = reward.into();
    let max_felt: felt252 = max_claims.into();
    let start_felt: felt252 = start.into();
    let end_felt: felt252 = end.into();

    let calldata = array![owner_felt, token_felt, reward_felt, max_felt, start_felt, end_felt];
    let (addr, _) = class.deploy(@calldata).unwrap();
    IRewardCampaignDispatcher { contract_address: addr }
}

fn deploy_registry() -> INullifierRegistryDispatcher {
    let class = declare("NullifierRegistry").unwrap().contract_class();
    let (addr, _) = class.deploy(@array![]).unwrap();
    INullifierRegistryDispatcher { contract_address: addr }
}

fn deploy_router() -> IRewardRouterDispatcher {
    let class = declare("RewardRouter").unwrap().contract_class();
    let owner: felt252 = owner_addr().into();
    let (addr, _) = class.deploy(@array![owner]).unwrap();
    IRewardRouterDispatcher { contract_address: addr }
}

#[test]
fn test_owner_can_fund_and_approve() {
    let campaign = deploy_campaign(100, 1000, 50, 10);
    assert(campaign.get_budget() == 0, 'budget starts 0');

    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.fund(500);
    assert(campaign.get_budget() == 500, 'budget 500');

    let conv_id: felt252 = 0x999;
    assert(!campaign.is_conversion_approved(conv_id), 'not approved');
    campaign.approve_conversion(conv_id);
    assert(campaign.is_conversion_approved(conv_id), 'approved');
    stop_cheat_caller_address(campaign.contract_address);
}

#[test]
#[should_panic(expected: 'NOT_AUTHORIZED')]
fn test_non_owner_cannot_fund() {
    let campaign = deploy_campaign(100, 1000, 50, 10);
    start_cheat_caller_address(campaign.contract_address, user_addr());
    campaign.fund(100);
    stop_cheat_caller_address(campaign.contract_address);
}

#[test]
fn test_pause_and_resume() {
    let campaign = deploy_campaign(100, 1000, 50, 10);
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.pause();
    campaign.resume();
    campaign.close();
    stop_cheat_caller_address(campaign.contract_address);
}

#[test]
fn test_full_claim_flow() {
    let start_time: u64 = 100;
    let end_time: u64 = 1000;
    let reward_amt: u128 = 50;
    let campaign = deploy_campaign(start_time, end_time, reward_amt, 10);
    let registry = deploy_registry();
    let router = deploy_router();

    // 1. Authorize campaign on router
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign.contract_address);
    stop_cheat_caller_address(router.contract_address);

    // 2. Fund campaign and approve conversion
    let conv_id: felt252 = 0xABC;
    start_cheat_caller_address(campaign.contract_address, owner_addr());
    campaign.fund(500);
    campaign.approve_conversion(conv_id);
    stop_cheat_caller_address(campaign.contract_address);

    // 3. Perform claim at timestamp 200
    start_cheat_block_timestamp(campaign.contract_address, 200);
    start_cheat_caller_address(campaign.contract_address, user_addr());
    campaign.claim_reward(
        registry.contract_address,
        router.contract_address,
        conv_id,
        0xDEADBEEF,
        0x123456,
        0x1,
        reward_amt
    );
    stop_cheat_caller_address(campaign.contract_address);
    stop_cheat_block_timestamp(campaign.contract_address);

    assert(campaign.get_budget() == 450, 'budget decremented');
    assert(!campaign.is_conversion_approved(conv_id), 'approval consumed');
    assert(registry.is_nullifier_used(campaign.contract_address, 0xDEADBEEF), 'nullifier used');
}
