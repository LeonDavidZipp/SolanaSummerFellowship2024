use anchor_lang::prelude::*;

declare_id!("7svqDu7iEfv47vCQHCPfXvgZ9pgfqTXEmdepVsZRHNZ1");

#[program]
pub mod token_vault {
    use super::*;

    pub fn initialize(ctx: Context<InitializeAccounts>) -> Result<()> {
        let vault = &mut ctx.account.vault;
        Ok(())
    }

    pub fn withdraw(ctx: Context<WithdrawAccounts>) -> Result<()> {
        Ok(())
    }

    pub fn deposit(ctx: Context<DepositAccounts>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, payer = user, space = 8 + 32 + 32 + 8 + 1024, seeds = [b"vault", manager.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    #[account(init, payer = user, token::mint = mint, token::authority = vault)]
    /// CHECK: only read
    pub manager: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawAccounts<'info> {
    
}

#[derive(Accounts)]
pub struct DepositAccounts<'info> {
    
}

#[account]
pub struct Vault {
    pub manager: Pubkey, // manager of the vault
    pub mint: Pubkey, // mint that is allowed
    pub deposits: Vec<(Pubkey, u64)>, // user deposits
}
