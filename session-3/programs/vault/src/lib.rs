use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Transfer, transfer};
use std::collections::HashMap;

declare_id!("C93fyDjEmyAfr9nwDeWMVCeWVVx8fjySxnshSA9VY4KG");

#[program]
pub mod asset_manager {
    use super::*;
    // use anchor_spl::token::{Transfer, transfer};

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.manager = *ctx.accounts.manager.key;
        vault.deposits = HashMap::new();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_ctx, amount)?;

        let user_key = *ctx.accounts.user.key;
        let vault = &mut ctx.accounts.vault;
        let user_deposit = vault.deposits.entry(user_key).or_insert(0);
        *user_deposit += amount;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_key = *ctx.accounts.user.key;

        // Prevent the manager from withdrawing funds
        if user_key == vault.manager {
            return Err(ErrorCode::Unauthorized.into());
        }

        let user_deposit = vault.deposits.get_mut(&user_key).ok_or(ErrorCode::InsufficientFunds)?;
        require!(*user_deposit >= amount, ErrorCode::InsufficientFunds);

        *user_deposit -= amount;

        // Perform the token transfer using the vault's authority
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(), // Use vault's authority
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

// validator structs
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(init, payer = manager, space = 8 + 32)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

// accounts:
#[account]
#[derive(Default)]
pub struct Vault {
    pub manager: Pubkey,
    pub deposits: HashMap<Pubkey, u64>
}

// errors:
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized access")]
    Unauthorized,
}
