import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssetManager } from "../target/types/asset_manager";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";

describe("asset_manager", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AssetManager as Program<AssetManager>;

  let vault: anchor.web3.Keypair;
  let user: anchor.web3.Keypair;
  let mint: anchor.web3.PublicKey;
  let userTokenAccount: anchor.web3.PublicKey;
  let vaultTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    // Create a new mint and token accounts
    mint = await Token.createMint(
        provider.connection,
        provider.wallet.payer,
        provider.wallet.publicKey,
        null,
        9,
        TOKEN_PROGRAM_ID
    );

    user = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(user.publicKey, 1000000000);

    userTokenAccount = await mint.createAccount(user.publicKey);
    await mint.mintTo(userTokenAccount, provider.wallet.publicKey, [], 1000);

    vaultTokenAccount = await mint.createAccount(provider.wallet.publicKey);
  });

    it("Initializes a vault", async () => {
        // Generate keypairs for user and manager
        const user = Keypair.generate();
        const manager = Keypair.generate();

        // Airdrop SOL to the user
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(user.publicKey, 1_000_000_000),
            "confirmed"
        );

        // Create the vault account
        const vault = Keypair.generate();

        // Call the initialize_vault function
        await program.methods
            .initializeVault()
            .accounts({
                user: user.publicKey,
                manager: manager.publicKey,
                vault: vault.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([user, vault])
            .rpc();

        // Fetch the vault account to verify initialization
        const vaultAccount = await program.account.vault.fetch(vault.publicKey);
        console.log("Vault account:", vaultAccount);
    });

  it("Deposits tokens into the vault", async () => {
    await program.methods
        .deposit(new anchor.BN(500))
        .accounts({
          user: user.publicKey,
          userTokenAccount: userTokenAccount,
          vault: vault.publicKey,
          vaultTokenAccount: vaultTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

    const vaultAccount = await program.account.vault.fetch(vault.publicKey);
    const userDeposit = vaultAccount.deposits.find((d: any) => d[0].toBase58() === user.publicKey.toBase58());
    assert.equal(userDeposit[1].toNumber(), 500);
  });

  it("Deposit Overflow", async() => {

  })

  it("Withdraw", async() => {

  })

  it("Withdraw Underflow", async() => {

  })

  it("Manager cannot withdraw", async() => {

  })
});
