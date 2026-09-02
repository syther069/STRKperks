use core::traits::TryInto;
use snforge_std::{ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;
use strkperks_contracts::campaign_factory::{ICampaignFactoryDispatcher, ICampaignFactoryDispatcherTrait};
use strkperks_contracts::reward_campaign::{IRewardCampaignDispatcher, IRewardCampaignDispatcherTrait};

fn owner() -> ContractAddress { 0x1111.try_into().unwrap() }

fn deploy_factory() -> ICampaignFactoryDispatcher {
    let campaign_class = declare("RewardCampaign").unwrap().contract_class();
    let router_class = declare("RewardRouter").unwrap().contract_class();
    let registry_class = declare("NullifierRegistry").unwrap().contract_class();
    let (registry, _) = registry_class.deploy(@array![]).unwrap();
    let factory_class = declare("CampaignFactory").unwrap().contract_class();
    let campaign_hash: felt252 = (*campaign_class.class_hash).into();
    let router_hash: felt252 = (*router_class.class_hash).into();
    let registry_felt: felt252 = registry.into();
    let (address, _) = factory_class.deploy(@array![campaign_hash, router_hash, registry_felt, 0x2222, 0x3333]).unwrap();
    ICampaignFactoryDispatcher { contract_address: address }
}

#[test]
fn test_factory_deploys_wires_and_transfers_ownership() {
    let factory = deploy_factory();
    start_cheat_caller_address(factory.contract_address, owner());
    let (campaign_address, router_address) = factory.create_campaign(50, 10, 100, 1_000, 0xA11CE);
    stop_cheat_caller_address(factory.contract_address);
    let campaign = IRewardCampaignDispatcher { contract_address: campaign_address };
    assert(factory.get_campaign_count() == 1, 'campaign count');
    assert(factory.get_campaign(0) == campaign_address, 'campaign indexed');
    assert(factory.get_router(0) == router_address, 'router indexed');
    assert(campaign.get_owner() == owner(), 'ownership transferred');
    assert(campaign.get_anonymizer() == router_address, 'router configured');
}

#[test]
#[should_panic(expected: 'INVALID_AMOUNT')]
fn test_factory_rejects_zero_reward() {
    let factory = deploy_factory();
    factory.create_campaign(0, 10, 100, 1_000, 1);
}

#[test]
#[should_panic(expected: 'INVALID_MAX_CLAIMS')]
fn test_factory_rejects_zero_claim_limit() {
    let factory = deploy_factory();
    factory.create_campaign(50, 0, 100, 1_000, 1);
}

#[test]
#[should_panic(expected: 'INVALID_WINDOW')]
fn test_factory_rejects_invalid_window() {
    let factory = deploy_factory();
    factory.create_campaign(50, 10, 1_000, 100, 1);
}
