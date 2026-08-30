use starknet::ContractAddress;

#[starknet::interface]
pub trait INullifierRegistry<TContractState> {
    fn is_nullifier_used(self: @TContractState, campaign: ContractAddress, nullifier: felt252) -> bool;
    fn consume_nullifier(ref self: TContractState, campaign: ContractAddress, nullifier: felt252);
    fn get_campaign_nullifier_count(self: @TContractState, campaign: ContractAddress) -> u32;
}

#[starknet::contract]
mod NullifierRegistry {
    use super::INullifierRegistry;
    use super::ContractAddress;
    use starknet::storage::{Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess};
    use crate::errors::NULLIFIER_USED;
    use starknet::event::EventEmitter;

    #[storage]
    struct Storage { consumed: Map<felt252, bool>, counts: Map<ContractAddress, u32> }
    use core::hash::HashStateTrait;
    use core::poseidon::PoseidonTrait;
    fn scoped_key(campaign: ContractAddress, nullifier: felt252) -> felt252 {
        let address: felt252 = campaign.into();
        PoseidonTrait::new().update(address).update(nullifier).finalize()
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        NullifierConsumed: NullifierConsumed,
    }

    #[derive(Drop, starknet::Event)]
    struct NullifierConsumed { campaign: ContractAddress, nullifier: felt252 }

    #[abi(embed_v0)]
    impl Impl of INullifierRegistry<ContractState> {
        fn is_nullifier_used(self: @ContractState, campaign: ContractAddress, nullifier: felt252) -> bool {
            self.consumed.entry(scoped_key(campaign, nullifier)).read()
        }

        fn consume_nullifier(ref self: ContractState, campaign: ContractAddress, nullifier: felt252) {
            assert(starknet::get_caller_address() == campaign, 'CAMPAIGN_NOT_AUTHORIZED');
            let key = scoped_key(campaign, nullifier);
            assert(!self.consumed.entry(key).read(), NULLIFIER_USED);
            self.consumed.entry(key).write(true);
            self.counts.entry(campaign).write(self.counts.entry(campaign).read() + 1);
            self.emit(NullifierConsumed { campaign, nullifier });
        }

        fn get_campaign_nullifier_count(self: @ContractState, campaign: ContractAddress) -> u32 {
            self.counts.entry(campaign).read()
        }
    }
}
