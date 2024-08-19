use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, transfer, Transfer};
use std::mem::size_of;

declare_id!("7svqDu7iEfv47vCQHCPfXvgZ9pgfqTXEmdepVsZRHNZ1");

#[program]
pub mod token_vault {
    // use anchor_lang::system_program::Transfer;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.manager = *ctx.accounts.manager.key;
        vault.mint = ctx.accounts.mint.key();
        vault.deposits = Vec::new();
        Ok(())
    }

    pub fn withdraw(ctx: Context<TransactionAccounts>) -> Result<()> {
        // require_neq!(vault.manager, )
        Ok(())
    }

    pub fn deposit(ctx: Context<TransactionAccounts>, amount: u64) -> Result<()> {
        let from = &ctx.accounts.from;
        let from_token_account = &mut ctx.accounts.from_token_account;
        // let vault = &ctx.accounts.vault;
        let vault_token_account = &mut ctx.accounts.vault_token_account;
        // let mint = &ctx.accounts.mint;

        let cpi_accounts = Transfer{
            from: from_token_account.to_account_info(),
            to: vault_token_account.to_account_info(),
            authority: from.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK: only read
    pub manager: UncheckedAccount<'info>,
    #[account(
        init,
        payer = signer,
        seeds = [b"vault", manager.key.as_ref()],
        bump,
        space = 8 + size_of::<Vault>() + size_of::<Vec<(Pubkey, u64)>>() + size_of::<Vec<(Pubkey, u64)>>() * 100,
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        init,
        payer = signer,
        token::mint = mint,
        token::authority = vault,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransactionAccounts<'info> {
    #[account(mut)]
    pub from:  Signer<'info>,
    #[account(mut, token::mint = mint, token::authority = from)]
    pub from_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut, token::mint = mint, token::authority = vault)]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

// #[derive(Accounts)]
// pub struct DepositAccounts<'info> {
    
// }

#[account]
pub struct Vault {
    pub manager: Pubkey, // manager of the vault
    pub mint: Pubkey, // mint that is allowed
    pub deposits: Vec<(Pubkey, u64)>, // user deposits
}
