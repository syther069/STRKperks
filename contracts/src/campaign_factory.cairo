use starknet::ContractAddress;

#[starknet::interface]
pub trait ICampaignFactory<TContractState> {
    fn create_campaign(ref self: TContractState, campaign: ContractAddress);
    fn get_campaign(self: @TContractState, campaign_id: u32) -> ContractAddress;
    fn get_campaign_count(self: @TContractState) -> u32;
}

#[starknet::contract]
mod CampaignFactory {
    use super::{ContractAddress, ICampaignFactory};
    use core::num::traits::Zero;
    use starknet::storage::{Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::event::EventEmitter;
    #[storage]
    struct Storage { campaigns: Map<u32, ContractAddress>, registered: Map<ContractAddress, bool>, count: u32 }
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event { CampaignCreated: CampaignCreated }
    #[derive(Drop, starknet::Event)]
    struct CampaignCreated { campaign_id: felt252, campaign: ContractAddress, owner: ContractAddress }
    #[abi(embed_v0)]
    impl Impl of ICampaignFactory<ContractState> {
        fn create_campaign(ref self: ContractState, campaign: ContractAddress) {
            assert(campaign.is_non_zero(), 'INVALID_CAMPAIGN');
            assert(!self.registered.entry(campaign).read(), 'CAMPAIGN_ALREADY_REGISTERED');
            let id = self.count.read();
            let owner = starknet::get_caller_address();
            self.campaigns.entry(id).write(campaign);
            self.registered.entry(campaign).write(true);
            self.count.write(id + 1);
            self.emit(CampaignCreated { campaign_id: id.into(), campaign, owner });
        }
        fn get_campaign(self: @ContractState, campaign_id: u32) -> ContractAddress { self.campaigns.entry(campaign_id).read() }
        fn get_campaign_count(self: @ContractState) -> u32 { self.count.read() }
    }
}
