use anchor_lang::prelude::*;

declare_id!("2GtDDP5dj8GpefRuTw25kUmc4RPRstjHyUGTd39n5Qpq");

#[program]
pub mod basic {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
