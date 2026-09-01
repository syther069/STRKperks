use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;
use core::traits::TryInto;
use strkperks_contracts::campaign_factory::{ICampaignFactoryDispatcher, ICampaignFactoryDispatcherTrait};

fn deploy_factory() -> ICampaignFactoryDispatcher {
    let class = declare("CampaignFactory").unwrap().contract_class();
    let (addr, _) = class.deploy(@array![]).unwrap();
    ICampaignFactoryDispatcher { contract_address: addr }
}

#[test]
fn test_factory_creates_and_retrieves_campaigns() {
    let factory = deploy_factory();
    assert(factory.get_campaign_count() == 0, 'initial count 0');

    let c1: ContractAddress = 0xAAAA.try_into().unwrap();
    let c2: ContractAddress = 0xBBBB.try_into().unwrap();

    let owner: ContractAddress = 0x1111.try_into().unwrap();
    start_cheat_caller_address(factory.contract_address, owner);
    factory.create_campaign(c1);
    factory.create_campaign(c2);
    stop_cheat_caller_address(factory.contract_address);

    assert(factory.get_campaign_count() == 2, 'count should be 2');
    assert(factory.get_campaign(0) == c1, 'campaign 0 matches');
    assert(factory.get_campaign(1) == c2, 'campaign 1 matches');
}

#[test]
#[should_panic(expected: 'INVALID_CAMPAIGN')]
fn test_factory_rejects_zero_campaign() {
    let factory = deploy_factory();
    factory.create_campaign(0x0.try_into().unwrap());
}

#[test]
#[should_panic(expected: 'CAMPAIGN_ALREADY_REGISTERED')]
fn test_factory_rejects_duplicate_campaign() {
    let factory = deploy_factory();
    let campaign: ContractAddress = 0xAAAA.try_into().unwrap();
    factory.create_campaign(campaign);
    factory.create_campaign(campaign);
}
