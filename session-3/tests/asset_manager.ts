import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenVault } from "../target/types/token_vault";
import {
    createMint,
    mintTo,
    createAssociatedTokenAccount,
    transfer,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("token_vault", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.TokenVault as Program<TokenVault>;
    const provider = anchor.getProvider();

    let mint: anchor.web3.PublicKey;
    let tokenAccount: anchor.web3.PublicKey;
    let manager: anchor.web3.Keypair;
    let user: anchor.web3.Keypair;
    let userTokenAccount: anchor.web3.PublicKey;
    let vaultTokenAccount: anchor.web3.PublicKey;
    let vaultPDA: anchor.web3.PublicKey;

    before(async () => {
        const signer = anchor.web3.Keypair.generate();
        let signature = await provider.connection.requestAirdrop(
            signer.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);

        mint = await createMint(
            provider.connection,
            signer,
            signer.publicKey,
            signer.publicKey,
            8
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

        // user = provider.connection.;
        user = anchor.web3.Keypair.generate();
        signature = await provider.connection.requestAirdrop(
            user.publicKey,
            20 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);

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

        [vaultPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), manager.publicKey.toBuffer()],
            program.programId
        );

        vaultTokenAccount = await getAssociatedTokenAddress(
            mint,
            vaultPDA,
            true,
            TOKEN_2022_PROGRAM_ID
        );
    });

    it("Initializes a vault", async () => {
        const transaction = await program.methods
            .initialize()
            .accounts({
                signer: user.publicKey,
                manager: manager.publicKey,
                mint: mint,
            })
            .signers([user])
            .rpc();

        console.log("transaction", transaction);
    });

    it("Deposits tokens into the vault", async () => {
        const amount = new anchor.BN(100); // Example amount to deposit

        try {
            const transaction = await program.methods
                .deposit(amount)
                .accounts({
                    from: user.publicKey,
                    vault: vaultPDA,
                    // userTokenAccount: userTokenAccount,
                    // vaultTokenAccount: vaultTokenAccount,
                    mint: mint,
                })
                .signers([user])
                .rpc();

            console.log("deposit transaction", transaction);
        } catch (error) {
            console.log("error", error);
        }
    });

    it("Deposit Overflow", async () => {});

    it("Withdraw", async () => {});

    it("Withdraw Underflow", async () => {});

    it("Manager cannot withdraw", async () => {});
});
