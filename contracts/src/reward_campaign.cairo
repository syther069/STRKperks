use starknet::ContractAddress;

#[starknet::interface]
pub trait IRewardCampaign<TContractState> {
    fn configure_anonymizer(ref self: TContractState, anonymizer: ContractAddress);
    fn fund_with_erc20(ref self: TContractState, amount: u128);
    fn approve_claim(
        ref self: TContractState,
        conversion_id: felt252,
        nullifier: felt252,
        note_id: felt252,
        authorization_expiry: u64,
    );
    fn claim_reward(
        ref self: TContractState,
        conversion_id: felt252,
        nullifier: felt252,
        note_id: felt252,
        authorization_expiry: u64,
    );
    fn pause(ref self: TContractState);
    fn resume(ref self: TContractState);
    fn close(ref self: TContractState);
    fn withdraw_unspent(ref self: TContractState, recipient: ContractAddress, amount: u128);
    fn get_budget(self: @TContractState) -> u128;
    fn get_anonymizer(self: @TContractState) -> ContractAddress;
    fn get_claim_commitment(
        self: @TContractState,
        conversion_id: felt252,
        nullifier: felt252,
        note_id: felt252,
        authorization_expiry: u64,
    ) -> felt252;
    fn is_claim_approved(self: @TContractState, claim_commitment: felt252) -> bool;
    fn is_conversion_claimed(self: @TContractState, conversion_id: felt252) -> bool;
}

#[starknet::contract]
mod RewardCampaign {
    use super::{ContractAddress, IRewardCampaign};
    use core::hash::HashStateTrait;
    use core::num::traits::Zero;
    use core::traits::TryInto;
    use core::poseidon::PoseidonTrait;
    use starknet::event::EventEmitter;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use crate::nullifier_registry::{
        INullifierRegistryDispatcher, INullifierRegistryDispatcherTrait,
    };

    const CLAIM_DOMAIN: felt252 = 'STRKPERKS_CLAIM_V2';

    #[starknet::interface]
    trait IERC20<TContractState> {
        fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
        fn transfer(
            ref self: TContractState, recipient: ContractAddress, amount: u256,
        ) -> bool;
        fn transfer_from(
            ref self: TContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool;
    }

    #[storage]
    struct Storage {
        owner: ContractAddress,
        reward_token: ContractAddress,
        nullifier_registry: ContractAddress,
        anonymizer: ContractAddress,
        reward_amount: u128,
        budget: u128,
        claimed: u32,
        max_claims: u32,
        start_time: u64,
        end_time: u64,
        paused: bool,
        closed: bool,
        approvals: Map<felt252, bool>,
        claimed_conversions: Map<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AnonymizerConfigured: AnonymizerConfigured,
        Funded: Funded,
        ClaimApproved: ClaimApproved,
        RewardClaimed: RewardClaimed,
        CampaignPaused: CampaignPaused,
        CampaignResumed: CampaignResumed,
        CampaignClosed: CampaignClosed,
    }

    #[derive(Drop, starknet::Event)]
    struct AnonymizerConfigured {
        anonymizer: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct Funded {
        amount: u128,
        new_budget: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct ClaimApproved {
        claim_commitment: felt252,
        conversion_id: felt252,
        authorization_expiry: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardClaimed {
        claim_commitment: felt252,
        conversion_id: felt252,
        nullifier: felt252,
        amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct CampaignPaused {}
    #[derive(Drop, starknet::Event)]
    struct CampaignResumed {}
    #[derive(Drop, starknet::Event)]
    struct CampaignClosed {}

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        reward_token: ContractAddress,
        nullifier_registry: ContractAddress,
        reward_amount: u128,
        max_claims: u32,
        start_time: u64,
        end_time: u64,
    ) {
        assert(owner.is_non_zero(), 'INVALID_OWNER');
        assert(reward_token.is_non_zero(), 'INVALID_TOKEN');
        assert(nullifier_registry.is_non_zero(), 'INVALID_REGISTRY');
        assert(reward_amount > 0, 'INVALID_AMOUNT');
        assert(max_claims > 0, 'INVALID_MAX_CLAIMS');
        assert(end_time > start_time, 'INVALID_WINDOW');
        self.owner.write(owner);
        self.reward_token.write(reward_token);
        self.nullifier_registry.write(nullifier_registry);
        self.reward_amount.write(reward_amount);
        self.max_claims.write(max_claims);
        self.start_time.write(start_time);
        self.end_time.write(end_time);
    }

    fn only_owner(self: @ContractState) {
        assert(starknet::get_caller_address() == self.owner.read(), 'NOT_AUTHORIZED');
    }

    fn active(self: @ContractState) {
        assert(!self.paused.read(), 'CAMPAIGN_PAUSED');
        assert(!self.closed.read(), 'CAMPAIGN_CLOSED');
        let now = starknet::get_block_timestamp();
        assert(now >= self.start_time.read(), 'CAMPAIGN_NOT_STARTED');
        assert(now <= self.end_time.read(), 'CAMPAIGN_EXPIRED');
    }

    fn claim_commitment(
        self: @ContractState,
        conversion_id: felt252,
        nullifier: felt252,
        note_id: felt252,
        authorization_expiry: u64,
    ) -> felt252 {
        let campaign: felt252 = starknet::get_contract_address().into();
        let token: felt252 = self.reward_token.read().into();
        PoseidonTrait::new()
            .update(CLAIM_DOMAIN)
            .update(campaign)
            .update(conversion_id)
            .update(nullifier)
            .update(note_id)
            .update(token)
            .update(self.reward_amount.read().into())
            .update(authorization_expiry.into())
            .finalize()
    }

    #[abi(embed_v0)]
    impl Impl of IRewardCampaign<ContractState> {
        fn configure_anonymizer(ref self: ContractState, anonymizer: ContractAddress) {
            only_owner(@self);
            assert(anonymizer.is_non_zero(), 'INVALID_ANONYMIZER');
            assert(self.anonymizer.read().is_zero(), 'ANONYMIZER_ALREADY_SET');
            self.anonymizer.write(anonymizer);
            self.emit(AnonymizerConfigured { anonymizer });
        }

        fn fund_with_erc20(ref self: ContractState, amount: u128) {
            only_owner(@self);
            assert(amount > 0, 'INVALID_AMOUNT');
            let token = IERC20Dispatcher { contract_address: self.reward_token.read() };
            let balance_before = token.balance_of(starknet::get_contract_address());
            let moved = token.transfer_from(
                starknet::get_caller_address(), starknet::get_contract_address(), amount.into(),
            );
            assert(moved, 'TOKEN_TRANSFER_FAILED');
            let balance_after = token.balance_of(starknet::get_contract_address());
            assert(balance_after >= balance_before, 'TOKEN_BALANCE_DECREASED');
            let received: u128 = (balance_after - balance_before).try_into().unwrap();
            assert(received > 0, 'TOKEN_TRANSFER_FAILED');
            let new_budget = self.budget.read() + received;
            self.budget.write(new_budget);
            self.emit(Funded { amount: received, new_budget });
        }

        fn approve_claim(
            ref self: ContractState,
            conversion_id: felt252,
            nullifier: felt252,
            note_id: felt252,
            authorization_expiry: u64,
        ) {
            only_owner(@self);
            assert(conversion_id != 0, 'INVALID_CONVERSION');
            assert(nullifier != 0, 'INVALID_NULLIFIER');
            assert(note_id != 0, 'INVALID_NOTE');
            assert(authorization_expiry > starknet::get_block_timestamp(), 'INVALID_EXPIRY');
            let commitment = claim_commitment(
                @self, conversion_id, nullifier, note_id, authorization_expiry,
            );
            self.approvals.entry(commitment).write(true);
            self.emit(
                ClaimApproved { claim_commitment: commitment, conversion_id, authorization_expiry },
            );
        }

        fn claim_reward(
            ref self: ContractState,
            conversion_id: felt252,
            nullifier: felt252,
            note_id: felt252,
            authorization_expiry: u64,
        ) {
            active(@self);
            let caller = starknet::get_caller_address();
            assert(caller == self.anonymizer.read(), 'CALLER_NOT_ANONYMIZER');
            assert(authorization_expiry >= starknet::get_block_timestamp(), 'AUTHORIZATION_EXPIRED');
            let commitment = claim_commitment(
                @self, conversion_id, nullifier, note_id, authorization_expiry,
            );
            assert(self.approvals.entry(commitment).read(), 'CLAIM_NOT_APPROVED');
            assert(!self.claimed_conversions.entry(conversion_id).read(), 'CONVERSION_ALREADY_CLAIMED');
            assert(self.claimed.read() < self.max_claims.read(), 'CLAIM_LIMIT_REACHED');
            let amount = self.reward_amount.read();
            assert(self.budget.read() >= amount, 'INSUFFICIENT_BUDGET');

            let registry = INullifierRegistryDispatcher {
                contract_address: self.nullifier_registry.read(),
            };
            registry.consume_nullifier(starknet::get_contract_address(), nullifier);
            self.approvals.entry(commitment).write(false);
            self.claimed_conversions.entry(conversion_id).write(true);
            self.budget.write(self.budget.read() - amount);
            self.claimed.write(self.claimed.read() + 1);

            let token = IERC20Dispatcher { contract_address: self.reward_token.read() };
            assert(token.transfer(caller, amount.into()), 'TOKEN_TRANSFER_FAILED');
            self.emit(
                RewardClaimed {
                    claim_commitment: commitment, conversion_id, nullifier, amount,
                },
            );
        }

        fn pause(ref self: ContractState) {
            only_owner(@self);
            self.paused.write(true);
            self.emit(CampaignPaused {});
        }

        fn resume(ref self: ContractState) {
            only_owner(@self);
            assert(!self.closed.read(), 'CAMPAIGN_CLOSED');
            self.paused.write(false);
            self.emit(CampaignResumed {});
        }

        fn close(ref self: ContractState) {
            only_owner(@self);
            self.closed.write(true);
            self.emit(CampaignClosed {});
        }

        fn withdraw_unspent(ref self: ContractState, recipient: ContractAddress, amount: u128) {
            only_owner(@self);
            assert(self.closed.read(), 'CAMPAIGN_NOT_CLOSED');
            assert(recipient.is_non_zero(), 'INVALID_RECIPIENT');
            assert(amount > 0 && amount <= self.budget.read(), 'INVALID_WITHDRAWAL');
            self.budget.write(self.budget.read() - amount);
            let token = IERC20Dispatcher { contract_address: self.reward_token.read() };
            assert(token.transfer(recipient, amount.into()), 'TOKEN_TRANSFER_FAILED');
        }

        fn get_budget(self: @ContractState) -> u128 {
            self.budget.read()
        }

        fn get_anonymizer(self: @ContractState) -> ContractAddress {
            self.anonymizer.read()
        }

        fn get_claim_commitment(
            self: @ContractState,
            conversion_id: felt252,
            nullifier: felt252,
            note_id: felt252,
            authorization_expiry: u64,
        ) -> felt252 {
            claim_commitment(self, conversion_id, nullifier, note_id, authorization_expiry)
        }

        fn is_claim_approved(self: @ContractState, claim_commitment: felt252) -> bool {
            self.approvals.entry(claim_commitment).read()
        }

        fn is_conversion_claimed(self: @ContractState, conversion_id: felt252) -> bool {
            self.claimed_conversions.entry(conversion_id).read()
        }
    }
}
