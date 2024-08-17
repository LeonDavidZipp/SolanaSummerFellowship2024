use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Token, Transfer, transfer, Mint};

declare_id!("7svqDu7iEfv47vCQHCPfXvgZ9pgfqTXEmdepVsZRHNZ1");

#[program]
mod asset_manager {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.manager = *ctx.accounts.manager.key;
        vault.deposits = Vec::new();
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
        let deposit = vault.get_deposit(&user_key).unwrap_or(0);
        let new_deposit = deposit.checked_add(amount).ok_or(ErrorCode::InsufficientFunds)?;
        vault.insert_deposit(user_key, new_deposit);

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_key = *ctx.accounts.user.key;

        // Prevent the manager from withdrawing funds
        if user_key == vault.manager {
            return Err(ErrorCode::Unauthorized.into());
        }

        let deposit = vault.get_deposit(&user_key).ok_or(ErrorCode::InsufficientFunds)?;
        require!(deposit >= amount, ErrorCode::InsufficientFunds);

        let new_deposit = deposit.checked_sub(amount).ok_or(ErrorCode::InsufficientFunds)?;
        vault.insert_deposit(user_key, new_deposit);

        // Perform the token transfer using the vault's authority
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
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
    #[account(mut)]
    pub user: Signer<'info>, // creator and signer do not have to be the same
    #[account(mut)]
    pub manager: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + 32
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        init,
        payer = user,
        token::mint = mint,
        token::authority = vault,
        seeds = [b"vault_token_account", vault.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        seeds = [b"vault_token_account", vault.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
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
    pub token_program: Program<'info, Token>,
}

// accounts:
#[account]
#[derive(Default)]
pub struct Vault {
    pub manager: Pubkey,
    pub deposits: Vec<(Pubkey, u64)>,
}

impl Vault {
    pub fn get_deposit(&self, key: &Pubkey) -> Option<u64> {
        self.deposits.iter().find(|(k, _)| k == key).map(|(_, v)| *v)
    }

    pub fn insert_deposit(&mut self, key: Pubkey, value: u64) {
        if let Some((_, v)) = self.deposits.iter_mut().find(|(k, _)| k == &key) {
            *v = value;
        } else {
            self.deposits.push((key, value));
        }
    }

    pub fn remove_deposit(&mut self, key: &Pubkey) -> Option<u64> {
        if let Some(pos) = self.deposits.iter().position(|(k, _)| k == key) {
            Some(self.deposits.remove(pos).1)
        } else {
            None
        }
    }
}

// errors:
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized access")]
    Unauthorized,
}
