use anchor_lang::prelude::*;

declare_id!("EAiteMURM1yCj8FBBkfhZYWCJwZCPN3C83PRmNX5R6H5");

#[program]
pub mod sol_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
