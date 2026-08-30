use starknet::ContractAddress;

#[starknet::interface]
pub trait IRewardRouter<TContractState> {
    fn authorize_campaign(ref self: TContractState, campaign: ContractAddress);
    fn revoke_campaign(ref self: TContractState, campaign: ContractAddress);
    fn settle_private_reward(ref self: TContractState, campaign: ContractAddress, recipient_commitment: felt252, amount: u128, note_id: felt252);
    fn is_authorized(self: @TContractState, campaign: ContractAddress) -> bool;
}

#[starknet::contract]
mod RewardRouter {
    use super::{ContractAddress, IRewardRouter};
    use starknet::event::EventEmitter;
    use starknet::storage::{Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess};
    #[storage]
    struct Storage { owner: ContractAddress, authorized_campaigns: Map<ContractAddress, bool> }
    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) { assert(owner.is_non_zero(), 'INVALID_OWNER'); self.owner.write(owner); }
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event { PrivateRewardSettlementRequested: PrivateRewardSettlementRequested }
    #[derive(Drop, starknet::Event)]
    struct PrivateRewardSettlementRequested { campaign: ContractAddress, recipient_commitment: felt252, amount: u128, note_id: felt252 }
    fn only_owner(self: @ContractState) { assert(starknet::get_caller_address() == self.owner.read(), 'NOT_AUTHORIZED'); }
    #[abi(embed_v0)]
    impl Impl of IRewardRouter<ContractState> {
        fn authorize_campaign(ref self: ContractState, campaign: ContractAddress) { only_owner(@self); assert(campaign.is_non_zero(), 'INVALID_CAMPAIGN'); self.authorized_campaigns.entry(campaign).write(true); }
        fn revoke_campaign(ref self: ContractState, campaign: ContractAddress) { only_owner(@self); self.authorized_campaigns.entry(campaign).write(false); }
        fn settle_private_reward(ref self: ContractState, campaign: ContractAddress, recipient_commitment: felt252, amount: u128, note_id: felt252) { assert(self.authorized_campaigns.entry(campaign).read(), 'CAMPAIGN_NOT_AUTHORIZED'); assert(starknet::get_caller_address() == campaign, 'CALLER_NOT_CAMPAIGN'); assert(amount > 0, 'INVALID_AMOUNT'); assert(recipient_commitment != 0, 'INVALID_COMMITMENT'); self.emit(PrivateRewardSettlementRequested { campaign, recipient_commitment, amount, note_id }); }
        fn is_authorized(self: @ContractState, campaign: ContractAddress) -> bool { self.authorized_campaigns.entry(campaign).read() }
    }
}
