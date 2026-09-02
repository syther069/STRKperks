use starknet::{ClassHash, ContractAddress};

#[starknet::interface]
pub trait ICampaignFactory<TContractState> {
    fn create_campaign(
        ref self: TContractState,
        reward_amount: u128,
        max_claims: u32,
        start_time: u64,
        end_time: u64,
        salt: felt252,
    ) -> (ContractAddress, ContractAddress);
    fn get_campaign(self: @TContractState, campaign_id: u32) -> ContractAddress;
    fn get_router(self: @TContractState, campaign_id: u32) -> ContractAddress;
    fn get_campaign_count(self: @TContractState) -> u32;
    fn get_campaign_class_hash(self: @TContractState) -> ClassHash;
    fn get_router_class_hash(self: @TContractState) -> ClassHash;
    fn get_registry(self: @TContractState) -> ContractAddress;
    fn get_pool(self: @TContractState) -> ContractAddress;
    fn get_reward_token(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
mod CampaignFactory {
    use super::{ClassHash, ContractAddress, ICampaignFactory};
    use core::hash::HashStateTrait;
    use core::num::traits::Zero;
    use core::poseidon::PoseidonTrait;
    use starknet::event::EventEmitter;
    use starknet::syscalls::deploy_syscall;
    use starknet::storage::{Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess};
    use crate::reward_campaign::{IRewardCampaignDispatcher, IRewardCampaignDispatcherTrait};

    #[storage]
    struct Storage {
        campaign_class_hash: ClassHash,
        router_class_hash: ClassHash,
        registry: ContractAddress,
        privacy_pool: ContractAddress,
        reward_token: ContractAddress,
        campaigns: Map<u32, ContractAddress>,
        routers: Map<u32, ContractAddress>,
        count: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event { CampaignCreated: CampaignCreated }

    #[derive(Drop, starknet::Event)]
    struct CampaignCreated {
        #[key]
        campaign_id: felt252,
        campaign: ContractAddress,
        router: ContractAddress,
        owner: ContractAddress,
        reward_token: ContractAddress,
        reward_amount: u128,
        max_claims: u32,
        start_time: u64,
        end_time: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        campaign_class_hash: ClassHash,
        router_class_hash: ClassHash,
        registry: ContractAddress,
        privacy_pool: ContractAddress,
        reward_token: ContractAddress,
    ) {
        assert(!campaign_class_hash.is_zero(), 'INVALID_CAMPAIGN_CLASS');
        assert(!router_class_hash.is_zero(), 'INVALID_ROUTER_CLASS');
        assert(registry.is_non_zero(), 'INVALID_REGISTRY');
        assert(privacy_pool.is_non_zero(), 'INVALID_POOL');
        assert(reward_token.is_non_zero(), 'INVALID_TOKEN');
        self.campaign_class_hash.write(campaign_class_hash);
        self.router_class_hash.write(router_class_hash);
        self.registry.write(registry);
        self.privacy_pool.write(privacy_pool);
        self.reward_token.write(reward_token);
    }

    #[abi(embed_v0)]
    impl Impl of ICampaignFactory<ContractState> {
        fn create_campaign(
            ref self: ContractState,
            reward_amount: u128,
            max_claims: u32,
            start_time: u64,
            end_time: u64,
            salt: felt252,
        ) -> (ContractAddress, ContractAddress) {
            assert(reward_amount > 0, 'INVALID_AMOUNT');
            assert(max_claims > 0, 'INVALID_MAX_CLAIMS');
            assert(end_time > start_time, 'INVALID_WINDOW');
            let final_owner = starknet::get_caller_address();
            assert(final_owner.is_non_zero(), 'INVALID_OWNER');
            let factory = starknet::get_contract_address();
            let factory_felt: felt252 = factory.into();
            let token = self.reward_token.read();
            let token_felt: felt252 = token.into();
            let registry = self.registry.read();
            let registry_felt: felt252 = registry.into();
            let campaign_calldata = array![
                factory_felt,
                token_felt,
                registry_felt,
                reward_amount.into(),
                max_claims.into(),
                start_time.into(),
                end_time.into(),
            ];
            let (campaign, _) = deploy_syscall(
                self.campaign_class_hash.read(), salt, campaign_calldata.span(), false,
            ).unwrap();

            let router_salt = PoseidonTrait::new().update('STRKPERKS_ROUTER').update(salt).finalize();
            let pool_felt: felt252 = self.privacy_pool.read().into();
            let campaign_felt: felt252 = campaign.into();
            let router_calldata = array![pool_felt, campaign_felt, token_felt];
            let (router, _) = deploy_syscall(
                self.router_class_hash.read(), router_salt, router_calldata.span(), false,
            ).unwrap();

            let campaign_dispatcher = IRewardCampaignDispatcher { contract_address: campaign };
            campaign_dispatcher.configure_anonymizer(router);
            campaign_dispatcher.transfer_ownership(final_owner);

            let id = self.count.read();
            self.campaigns.entry(id).write(campaign);
            self.routers.entry(id).write(router);
            self.count.write(id + 1);
            self.emit(CampaignCreated {
                campaign_id: id.into(), campaign, router, owner: final_owner,
                reward_token: token, reward_amount, max_claims, start_time, end_time,
            });
            (campaign, router)
        }

        fn get_campaign(self: @ContractState, campaign_id: u32) -> ContractAddress { self.campaigns.entry(campaign_id).read() }
        fn get_router(self: @ContractState, campaign_id: u32) -> ContractAddress { self.routers.entry(campaign_id).read() }
        fn get_campaign_count(self: @ContractState) -> u32 { self.count.read() }
        fn get_campaign_class_hash(self: @ContractState) -> ClassHash { self.campaign_class_hash.read() }
        fn get_router_class_hash(self: @ContractState) -> ClassHash { self.router_class_hash.read() }
        fn get_registry(self: @ContractState) -> ContractAddress { self.registry.read() }
        fn get_pool(self: @ContractState) -> ContractAddress { self.privacy_pool.read() }
        fn get_reward_token(self: @ContractState) -> ContractAddress { self.reward_token.read() }
    }
}
