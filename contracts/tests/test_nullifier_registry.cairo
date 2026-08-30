use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;
use core::traits::TryInto;
use strkperks_contracts::nullifier_registry::{INullifierRegistryDispatcher, INullifierRegistryDispatcherTrait};

fn deploy_registry() -> INullifierRegistryDispatcher {
    let class = declare("NullifierRegistry").unwrap().contract_class();
    let (addr, _) = class.deploy(@array![]).unwrap();
    INullifierRegistryDispatcher { contract_address: addr }
}

fn campaign_addr() -> ContractAddress { 0xCAFE.try_into().unwrap() }
fn campaign2_addr() -> ContractAddress { 0xBEEF.try_into().unwrap() }

#[test]
fn test_fresh_nullifier_is_consumed() {
    let registry = deploy_registry();
    let campaign = campaign_addr();
    let nullifier: felt252 = 0x1234;
    assert(!registry.is_nullifier_used(campaign, nullifier), 'should start unused');
    start_cheat_caller_address(registry.contract_address, campaign);
    registry.consume_nullifier(campaign, nullifier);
    stop_cheat_caller_address(registry.contract_address);
    assert(registry.is_nullifier_used(campaign, nullifier), 'should be used');
}

#[test]
#[should_panic(expected: 'NULLIFIER_USED')]
fn test_double_consume_reverts() {
    let registry = deploy_registry();
    let campaign = campaign_addr();
    let nullifier: felt252 = 0x1111;
    start_cheat_caller_address(registry.contract_address, campaign);
    registry.consume_nullifier(campaign, nullifier);
    registry.consume_nullifier(campaign, nullifier);
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
fn test_different_campaign_same_nullifier_ok() {
    let registry = deploy_registry();
    let c1 = campaign_addr();
    let c2 = campaign2_addr();
    let nullifier: felt252 = 0xABCD;
    start_cheat_caller_address(registry.contract_address, c1);
    registry.consume_nullifier(c1, nullifier);
    stop_cheat_caller_address(registry.contract_address);
    start_cheat_caller_address(registry.contract_address, c2);
    registry.consume_nullifier(c2, nullifier);
    stop_cheat_caller_address(registry.contract_address);
    assert(registry.is_nullifier_used(c1, nullifier), 'c1 used');
    assert(registry.is_nullifier_used(c2, nullifier), 'c2 used');
}

#[test]
#[should_panic(expected: 'CAMPAIGN_NOT_AUTHORIZED')]
fn test_non_campaign_caller_reverts() {
    let registry = deploy_registry();
    let campaign = campaign_addr();
    let impostor: ContractAddress = 0xDEAD.try_into().unwrap();
    start_cheat_caller_address(registry.contract_address, impostor);
    registry.consume_nullifier(campaign, 0x9999);
    stop_cheat_caller_address(registry.contract_address);
}

#[test]
fn test_per_campaign_count_increments() {
    let registry = deploy_registry();
    let campaign = campaign_addr();
    assert(registry.get_campaign_nullifier_count(campaign) == 0, 'initial count');
    start_cheat_caller_address(registry.contract_address, campaign);
    registry.consume_nullifier(campaign, 0x0001);
    registry.consume_nullifier(campaign, 0x0002);
    registry.consume_nullifier(campaign, 0x0003);
    stop_cheat_caller_address(registry.contract_address);
    assert(registry.get_campaign_nullifier_count(campaign) == 3, 'count after 3');
}
