// use anchor_lang::prelude::*;
// use anchor_spl::token::{TokenAccount, Token, Transfer, transfer, Mint};
// use std::mem::size_of;

// declare_id!("7svqDu7iEfv47vCQHCPfXvgZ9pgfqTXEmdepVsZRHNZ1");

// #[program]
// mod asset_manager {
//     use super::*;

//     pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
//         let vault = &mut ctx.accounts.vault;
//         vault.manager = *ctx.accounts.manager.key;
//         vault.deposits = Vec::new();
//         vault.mint = ctx.accounts.mint.key();
//         Ok(())
//     }

//     pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
//         let user_key = *ctx.accounts.user.key;
//         let vault = &mut ctx.accounts.vault;
//         let mint = ctx.accounts.vault_token_account.mint;

//         require_eq!(mint, ctx.accounts.user_token_account.mint, ErrorCode::InvalidToken);
//         require_neq!(user_key, vault.manager, ErrorCode::Unauthorized);


//         let cpi_accounts = Transfer {
//             from: ctx.accounts.user_token_account.to_account_info(),
//             to: ctx.accounts.vault_token_account.to_account_info(),
//             authority: ctx.accounts.user.to_account_info(),
//         };
//         let cpi_program = ctx.accounts.token_program.to_account_info();
//         let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

//         transfer(cpi_ctx, amount)?;

//         let deposit = vault.get_deposit(&user_key).unwrap_or(0);
//         let new_deposit = deposit.checked_add(amount).ok_or(ErrorCode::InsufficientFunds)?;
//         vault.insert_deposit(user_key, new_deposit);

//         Ok(())
//     }

//     pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
//         let vault = &mut ctx.accounts.vault;
//         let user_key = *ctx.accounts.user.key;
//         let mint = ctx.accounts.vault_token_account.mint;

//         require_eq!(mint, ctx.accounts.user_token_account.mint, ErrorCode::InvalidToken);
//         require_neq!(user_key, vault.manager, ErrorCode::Unauthorized);

//         let deposit = vault.get_deposit(&user_key).ok_or(ErrorCode::InsufficientFunds)?;
//         require!(deposit >= amount, ErrorCode::InsufficientFunds);

//         // Perform the token transfer using the vault's authority
//         let cpi_accounts = Transfer {
//             from: ctx.accounts.vault_token_account.to_account_info(),
//             to: ctx.accounts.user_token_account.to_account_info(),
//             authority: vault.to_account_info(),
//         };
//         let cpi_program = ctx.accounts.token_program.to_account_info();
//         let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
//         transfer(cpi_ctx, amount)?;

//         let new_deposit = deposit.checked_sub(amount).ok_or(ErrorCode::InsufficientFunds)?;
//         vault.insert_deposit(user_key, new_deposit);

//         Ok(())
//     }
// }

// // validator structs
// #[derive(Accounts)]
// pub struct InitializeVault<'info> {
//     #[account(mut, signer)]
//     pub user: Signer<'info>,
//     /// CHECK: only needs to be read
//     pub manager: AccountInfo<'info>,
//     #[account(
//         init,
//         payer = user,
//         space = size_of::<Vault>() + size_of::<Vec<(Pubkey, u64)>>(),
//         seeds = [b"vault", manager.key().as_ref()],
//         bump
//     )]
//     pub vault: Account<'info, Vault>,
//     #[account(
//         init,
//         payer = user,
//         token::mint = mint,
//         token::authority = vault,
//     )]
//     pub vault_token_account: Account<'info, TokenAccount>,
//     pub mint: Account<'info, Mint>,
//     pub system_program: Program<'info, System>,
//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct Deposit<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     #[account(mut)]
//     pub user_token_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub vault: Account<'info, Vault>,
//     #[account(mut)]
//     pub vault_token_account: Account<'info, TokenAccount>,
//     // pub mint: Account<'info, Mint>,
//     // pub system_program: Program<'info, System>,
//     pub token_program: Program<'info, Token>,
// }

// #[derive(Accounts)]
// pub struct Withdraw<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     #[account(
//         mut,
//         associated_token::mint = mint,
//         associated_token::authority = user
//     )]
//     pub user_token_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     pub vault: Account<'info, Vault>,
//     #[account(
//         mut,
//         associated_token::mint = mint,
//         associated_token::authority = vault
//     )]
//     pub vault_token_account: Account<'info, TokenAccount>,
//     pub mint: Account<'info, Mint>,
//     pub token_program: Program<'info, Token>,
// }

// // accounts:
// #[account]
// #[derive(Default)]
// pub struct Vault {
//     pub manager: Pubkey, // manager of the vault
//     pub mint: Pubkey, // mint that is allowed
//     pub deposits: Vec<(Pubkey, u64)>, // user deposits
// }

// impl Vault {
//     pub fn get_deposit(&self, key: &Pubkey) -> Option<u64> {
//         self.deposits.iter().find(|(k, _)| k == key).map(|(_, v)| *v)
//     }

//     pub fn insert_deposit(&mut self, key: Pubkey, value: u64) {
//         if let Some((_, v)) = self.deposits.iter_mut().find(|(k, _)| k == &key) {
//             *v = value;
//         } else {
//             self.deposits.push((key, value));
//         }
//     }

//     pub fn remove_deposit(&mut self, key: &Pubkey) -> Option<u64> {
//         if let Some(pos) = self.deposits.iter().position(|(k, _)| k == key) {
//             Some(self.deposits.remove(pos).1)
//         } else {
//             None
//         }
//     }
// }

// // errors:
// #[error_code]
// pub enum ErrorCode {
//     #[msg("Insufficient funds")]
//     InsufficientFunds,
//     #[msg("Unauthorized access")]
//     Unauthorized,
//     #[msg("Invalid token")]
//     InvalidToken,
// }
