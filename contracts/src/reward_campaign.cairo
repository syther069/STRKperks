use starknet::ContractAddress;

#[starknet::interface]
pub trait IRewardCampaign<TContractState> {
    fn fund(ref self: TContractState, amount: u128);
    fn fund_with_erc20(ref self: TContractState, amount: u128);
    fn approve_conversion(ref self: TContractState, conversion_id: felt252);
    fn claim_reward(ref self: TContractState, registry: ContractAddress, router: ContractAddress, conversion_id: felt252, nullifier: felt252, recipient_commitment: felt252, note_id: felt252, amount: u128);
    fn pause(ref self: TContractState);
    fn resume(ref self: TContractState);
    fn close(ref self: TContractState);
    fn get_budget(self: @TContractState) -> u128;
    fn is_conversion_approved(self: @TContractState, conversion_id: felt252) -> bool;
}

#[starknet::contract]
mod RewardCampaign {
    use super::{ContractAddress, IRewardCampaign};
    use starknet::storage::{Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess};
    use crate::nullifier_registry::{INullifierRegistryDispatcher, INullifierRegistryDispatcherTrait};
    use crate::reward_router::{IRewardRouterDispatcher, IRewardRouterDispatcherTrait};
    use starknet::event::EventEmitter;

    #[starknet::interface]
    trait IERC20<TContractState> {
        fn transfer_from(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    }

    #[storage]
    struct Storage {
        owner: ContractAddress,
        reward_token: ContractAddress,
        reward_amount: u128,
        budget: u128,
        claimed: u32,
        max_claims: u32,
        start_time: u64,
        end_time: u64,
        paused: bool,
        closed: bool,
        approvals: Map<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Funded: Funded,
        ConversionApproved: ConversionApproved,
        RewardClaimed: RewardClaimed,
        CampaignPaused: CampaignPaused,
        CampaignResumed: CampaignResumed,
        CampaignClosed: CampaignClosed,
    }
    #[derive(Drop, starknet::Event)]
    struct Funded { amount: u128, new_budget: u128 }
    #[derive(Drop, starknet::Event)]
    struct ConversionApproved { conversion_id: felt252 }
    #[derive(Drop, starknet::Event)]
    struct RewardClaimed { conversion_id: felt252, nullifier: felt252, amount: u128 }
    #[derive(Drop, starknet::Event)]
    struct CampaignPaused {}
    #[derive(Drop, starknet::Event)]
    struct CampaignResumed {}
    #[derive(Drop, starknet::Event)]
    struct CampaignClosed {}

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, reward_token: ContractAddress, reward_amount: u128, max_claims: u32, start_time: u64, end_time: u64) {
        assert(owner.is_non_zero(), 'INVALID_OWNER');
        assert(reward_token.is_non_zero(), 'INVALID_TOKEN');
        assert(reward_amount > 0, 'INVALID_AMOUNT');
        assert(max_claims > 0, 'INVALID_MAX_CLAIMS');
        assert(end_time > start_time, 'INVALID_WINDOW');
        self.owner.write(owner);
        self.reward_token.write(reward_token);
        self.reward_amount.write(reward_amount);
        self.max_claims.write(max_claims);
        self.start_time.write(start_time);
        self.end_time.write(end_time);
    }

    fn only_owner(self: @ContractState) { assert(starknet::get_caller_address() == self.owner.read(), 'NOT_AUTHORIZED'); }
    fn active(self: @ContractState) {
        assert(!self.paused.read(), 'CAMPAIGN_PAUSED');
        assert(!self.closed.read(), 'CAMPAIGN_CLOSED');
        let now = starknet::get_block_timestamp();
        assert(now >= self.start_time.read(), 'CAMPAIGN_NOT_STARTED');
        assert(now <= self.end_time.read(), 'CAMPAIGN_EXPIRED');
    }

    #[abi(embed_v0)]
    impl Impl of IRewardCampaign<ContractState> {
        fn fund(ref self: ContractState, amount: u128) {
            only_owner(@self);
            assert(amount > 0, 'INVALID_AMOUNT');
            self.budget.write(self.budget.read() + amount);
            self.emit(Funded { amount, new_budget: self.budget.read() });
        }
        fn fund_with_erc20(ref self: ContractState, amount: u128) {
            only_owner(@self);
            assert(amount > 0, 'INVALID_AMOUNT');
            let token = IERC20Dispatcher { contract_address: self.reward_token.read() };
            let moved = token.transfer_from(starknet::get_caller_address(), starknet::get_contract_address(), amount.into());
            assert(moved, 'TOKEN_TRANSFER_FAILED');
            self.budget.write(self.budget.read() + amount);
            self.emit(Funded { amount, new_budget: self.budget.read() });
        }
        fn approve_conversion(ref self: ContractState, conversion_id: felt252) {
            only_owner(@self);
            self.approvals.entry(conversion_id).write(true);
            self.emit(ConversionApproved { conversion_id });
        }
        fn claim_reward(ref self: ContractState, registry: ContractAddress, router: ContractAddress, conversion_id: felt252, nullifier: felt252, recipient_commitment: felt252, note_id: felt252, amount: u128) {
            active(@self);
            assert(self.approvals.entry(conversion_id).read(), 'CONVERSION_NOT_APPROVED');
            assert(amount == self.reward_amount.read(), 'INVALID_REWARD_AMOUNT');
            assert(self.claimed.read() < self.max_claims.read(), 'CLAIM_LIMIT_REACHED');
            assert(self.budget.read() >= amount, 'INSUFFICIENT_BUDGET');
            let dispatcher = INullifierRegistryDispatcher { contract_address: registry };
            dispatcher.consume_nullifier(starknet::get_contract_address(), nullifier);
            self.budget.write(self.budget.read() - amount);
            self.claimed.write(self.claimed.read() + 1);
            self.approvals.entry(conversion_id).write(false);
            let router_dispatcher = IRewardRouterDispatcher { contract_address: router };
            router_dispatcher.settle_private_reward(starknet::get_contract_address(), recipient_commitment, amount, note_id);
            self.emit(RewardClaimed { conversion_id, nullifier, amount });
        }
        fn pause(ref self: ContractState) { only_owner(@self); self.paused.write(true); self.emit(CampaignPaused {}); }
        fn resume(ref self: ContractState) { only_owner(@self); assert(!self.closed.read(), 'CAMPAIGN_CLOSED'); self.paused.write(false); self.emit(CampaignResumed {}); }
        fn close(ref self: ContractState) { only_owner(@self); self.closed.write(true); self.emit(CampaignClosed {}); }
        fn get_budget(self: @ContractState) -> u128 { self.budget.read() }
        fn is_conversion_approved(self: @ContractState, conversion_id: felt252) -> bool { self.approvals.entry(conversion_id).read() }
    }
}
