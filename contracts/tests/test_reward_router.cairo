use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;
use core::traits::TryInto;
use strkperks_contracts::reward_router::{IRewardRouterDispatcher, IRewardRouterDispatcherTrait};

fn owner_addr() -> ContractAddress { 0x1111.try_into().unwrap() }
fn campaign_addr() -> ContractAddress { 0xCAFE.try_into().unwrap() }
fn stranger_addr() -> ContractAddress { 0xDEAD.try_into().unwrap() }

fn deploy_router() -> IRewardRouterDispatcher {
    let class = declare("RewardRouter").unwrap().contract_class();
    let owner: felt252 = owner_addr().into();
    let (addr, _) = class.deploy(@array![owner]).unwrap();
    IRewardRouterDispatcher { contract_address: addr }
}

#[test]
fn test_owner_can_authorize_campaign() {
    let router = deploy_router();
    let campaign = campaign_addr();
    assert(!router.is_authorized(campaign), 'starts unauthorized');
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
    assert(router.is_authorized(campaign), 'should be authorized');
}

#[test]
#[should_panic(expected: 'NOT_AUTHORIZED')]
fn test_non_owner_cannot_authorize() {
    let router = deploy_router();
    start_cheat_caller_address(router.contract_address, stranger_addr());
    router.authorize_campaign(campaign_addr());
    stop_cheat_caller_address(router.contract_address);
}

#[test]
fn test_owner_can_revoke_campaign() {
    let router = deploy_router();
    let campaign = campaign_addr();
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign);
    router.revoke_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
    assert(!router.is_authorized(campaign), 'should be revoked');
}

#[test]
#[should_panic(expected: 'NOT_AUTHORIZED')]
fn test_non_owner_cannot_revoke() {
    let router = deploy_router();
    let campaign = campaign_addr();
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
    start_cheat_caller_address(router.contract_address, stranger_addr());
    router.revoke_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
}

#[test]
#[should_panic(expected: 'CAMPAIGN_NOT_AUTHORIZED')]
fn test_unauthorized_campaign_cannot_settle() {
    let router = deploy_router();
    let campaign = campaign_addr();
    start_cheat_caller_address(router.contract_address, campaign);
    router.settle_private_reward(campaign, 0xABCD, 100, 0x1);
    stop_cheat_caller_address(router.contract_address);
}

#[test]
#[should_panic(expected: 'CALLER_NOT_CAMPAIGN')]
fn test_non_campaign_caller_cannot_settle() {
    let router = deploy_router();
    let campaign = campaign_addr();
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
    start_cheat_caller_address(router.contract_address, stranger_addr());
    router.settle_private_reward(campaign, 0xABCD, 100, 0x1);
    stop_cheat_caller_address(router.contract_address);
}

#[test]
#[should_panic(expected: 'INVALID_AMOUNT')]
fn test_zero_amount_rejected() {
    let router = deploy_router();
    let campaign = campaign_addr();
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
    start_cheat_caller_address(router.contract_address, campaign);
    router.settle_private_reward(campaign, 0xABCD, 0, 0x1);
    stop_cheat_caller_address(router.contract_address);
}

#[test]
#[should_panic(expected: 'INVALID_COMMITMENT')]
fn test_zero_commitment_rejected() {
    let router = deploy_router();
    let campaign = campaign_addr();
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
    start_cheat_caller_address(router.contract_address, campaign);
    router.settle_private_reward(campaign, 0, 100, 0x1);
    stop_cheat_caller_address(router.contract_address);
}

#[test]
fn test_valid_settlement_succeeds() {
    let router = deploy_router();
    let campaign = campaign_addr();
    start_cheat_caller_address(router.contract_address, owner_addr());
    router.authorize_campaign(campaign);
    stop_cheat_caller_address(router.contract_address);
    start_cheat_caller_address(router.contract_address, campaign);
    router.settle_private_reward(campaign, 0xABCD, 100, 0x1);
    stop_cheat_caller_address(router.contract_address);
}
