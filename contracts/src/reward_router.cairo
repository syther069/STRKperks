use privacy::objects::OpenNoteDeposit;
use starknet::ContractAddress;

/// UNAUDITED DRAFT: must receive an independent Cairo security review before deployment.
#[starknet::interface]
pub trait IRewardRouter<TContractState> {
    fn privacy_invoke(
        ref self: TContractState,
        conversion_id: felt252,
        nullifier: felt252,
        note_id: felt252,
        authorization_expiry: u64,
    ) -> Span<OpenNoteDeposit>;
    fn get_pool(self: @TContractState) -> ContractAddress;
    fn get_campaign(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
mod RewardRouter {
    use super::{ContractAddress, IRewardRouter};
    use core::num::traits::Zero;
    use privacy::objects::OpenNoteDeposit;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use crate::reward_campaign::{IRewardCampaignDispatcher, IRewardCampaignDispatcherTrait};

    #[starknet::interface]
    trait IERC20<TContractState> {
        fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
        fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    }

    #[storage]
    struct Storage {
        privacy_pool: ContractAddress,
        campaign: ContractAddress,
        reward_token: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        privacy_pool: ContractAddress,
        campaign: ContractAddress,
        reward_token: ContractAddress,
    ) {
        assert(privacy_pool.is_non_zero(), 'INVALID_POOL');
        assert(campaign.is_non_zero(), 'INVALID_CAMPAIGN');
        assert(reward_token.is_non_zero(), 'INVALID_TOKEN');
        self.privacy_pool.write(privacy_pool);
        self.campaign.write(campaign);
        self.reward_token.write(reward_token);
    }

    #[abi(embed_v0)]
    impl Impl of IRewardRouter<ContractState> {
        fn privacy_invoke(
            ref self: ContractState,
            conversion_id: felt252,
            nullifier: felt252,
            note_id: felt252,
            authorization_expiry: u64,
        ) -> Span<OpenNoteDeposit> {
            let pool = self.privacy_pool.read();
            assert(starknet::get_caller_address() == pool, 'CALLER_NOT_PRIVACY');
            assert(conversion_id != 0, 'INVALID_CONVERSION');
            assert(nullifier != 0, 'INVALID_NULLIFIER');
            assert(note_id != 0, 'INVALID_NOTE');

            let token_address = self.reward_token.read();
            let token = IERC20Dispatcher { contract_address: token_address };
            let this = starknet::get_contract_address();
            let balance_before = token.balance_of(this);

            let campaign = IRewardCampaignDispatcher { contract_address: self.campaign.read() };
            campaign.claim_reward(conversion_id, nullifier, note_id, authorization_expiry);

            let balance_after = token.balance_of(this);
            let out_amount: u128 = (balance_after - balance_before)
                .try_into()
                .expect('REWARD_AMOUNT_OVERFLOW');
            assert(out_amount > 0, 'ZERO_REWARD_AMOUNT');
            assert(token.approve(pool, out_amount.into()), 'TOKEN_APPROVE_FAILED');

            [OpenNoteDeposit { note_id, token: token_address, amount: out_amount }].span()
        }

        fn get_pool(self: @ContractState) -> ContractAddress {
            self.privacy_pool.read()
        }

        fn get_campaign(self: @ContractState) -> ContractAddress {
            self.campaign.read()
        }
    }
}
