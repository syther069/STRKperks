use starknet::ContractAddress;

#[starknet::interface]
pub trait ITestToken<TContractState> {
    fn mint(ref self: TContractState, recipient: ContractAddress, amount: u256);
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(
        self: @TContractState, owner: ContractAddress, spender: ContractAddress,
    ) -> u256;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
}

#[starknet::contract]
mod TestToken {
    use super::{ContractAddress, ITestToken};
    use core::num::traits::Zero;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, initial_supply: u256) {
        self.owner.write(owner);
        self.balances.entry(owner).write(initial_supply);
    }

    fn move_tokens(
        ref self: ContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) {
        assert(recipient.is_non_zero(), 'INVALID_RECIPIENT');
        let sender_balance = self.balances.entry(sender).read();
        assert(sender_balance >= amount, 'INSUFFICIENT_BALANCE');
        self.balances.entry(sender).write(sender_balance - amount);
        self.balances.entry(recipient).write(self.balances.entry(recipient).read() + amount);
    }

    #[abi(embed_v0)]
    impl Impl of ITestToken<ContractState> {
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            assert(starknet::get_caller_address() == self.owner.read(), 'NOT_AUTHORIZED');
            self.balances.entry(recipient).write(self.balances.entry(recipient).read() + amount);
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.entry(account).read()
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress,
        ) -> u256 {
            self.allowances.entry((owner, spender)).read()
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            self.allowances.entry((starknet::get_caller_address(), spender)).write(amount);
            true
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            move_tokens(ref self, starknet::get_caller_address(), recipient, amount);
            true
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool {
            let caller = starknet::get_caller_address();
            let allowed = self.allowances.entry((sender, caller)).read();
            assert(allowed >= amount, 'INSUFFICIENT_ALLOWANCE');
            self.allowances.entry((sender, caller)).write(allowed - amount);
            move_tokens(ref self, sender, recipient, amount);
            true
        }
    }
}
