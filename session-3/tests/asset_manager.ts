import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssetManager } from "../target/types/asset_manager";
import {
    createMint,
    mintTo,
    createAssociatedTokenAccount,
    transfer,
} from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("asset_manager", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.local());

    const program = anchor.workspace.AssetManager as Program<AssetManager>;
    const provider = anchor.getProvider();

    let vault: anchor.web3.Keypair;
    let user: anchor.web3.Keypair;
    let manager: anchor.web3.Keypair;
    let mint: anchor.web3.PublicKey;
    let tokenAccount: anchor.web3.PublicKey;
    let userTokenAccount: anchor.web3.PublicKey;
    let vaultTokenAccount: anchor.web3.PublicKey;

    before(async () => {
        const signer = anchor.web3.Keypair.generate();
        let signature = await provider.connection.requestAirdrop(
            signer.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);
        console.log(
            "signer balance",
            await provider.connection.getBalance(signer.publicKey)
        );

        mint = await createMint(
            provider.connection,
            signer,
            signer.publicKey,
            signer.publicKey,
            9
        );

        tokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            signer,
            mint,
            signer.publicKey
        );

        await mintTo(
            provider.connection,
            signer,
            mint,
            tokenAccount,
            signer,
            1000
        );

        user = anchor.web3.Keypair.generate();
        signature = await provider.connection.requestAirdrop(
            user.publicKey,
            20 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);
        console.log(
            "user balance",
            await provider.connection.getBalance(user.publicKey)
        );

        userTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            signer,
            mint,
            user.publicKey
        );

        await transfer(
            provider.connection,
            signer,
            tokenAccount,
            userTokenAccount,
            signer,
            500
        );

        manager = anchor.web3.Keypair.generate();
        signature = await provider.connection.requestAirdrop(
            manager.publicKey,
            20 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);
        console.log(
            "manager balance",
            await provider.connection.getBalance(manager.publicKey)
        );

        vault = anchor.web3.Keypair.generate();
        vaultTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            signer,
            mint,
            vault.publicKey
        );
    });

    it("Initializes a vault", async () => {
        await program.methods
            .initializeVault()
            .accounts({
                user: user.publicKey,
                manager: manager.publicKey,
                vault: vault.publicKey,
                vaultTokenAccount: vaultTokenAccount,
                mint: mint,
            })
            .signers([user, manager, vault])
            .rpc();
    });

    it("Deposits tokens into the vault", async () => {
        // await program.methods
        //     .deposit(new anchor.BN(500))
        //     .accounts({
        //         user: user.publicKey,
        //         userTokenAccount: userTokenAccount,
        //         vault: vault.publicKey,
        //         vaultTokenAccount: vaultTokenAccount,
        //         tokenProgram: TOKEN_PROGRAM_ID,
        //     })
        //     .signers([user])
        //     .rpc();
        // const vaultAccount = await program.account.vault.fetch(vault.publicKey);
        // const userDeposit = vaultAccount.deposits.find(
        //     (d: any) => d[0].toBase58() === user.publicKey.toBase58()
        // );
        // assert.equal(userDeposit[1].toNumber(), 500);
    });

    it("Deposit Overflow", async () => {});

    it("Withdraw", async () => {});

    it("Withdraw Underflow", async () => {});

    it("Manager cannot withdraw", async () => {});
});
