import {
    Connection, clusterApiUrl,
    Keypair, SystemProgram, Transaction, PublicKey,
    LAMPORTS_PER_SOL, sendAndConfirmTransaction,
    BlockheightBasedTransactionConfirmationStrategy
} from "@solana/web3.js";
import bs58 from "bs58";
import { writeFileSync } from "fs";

let connection = new Connection(clusterApiUrl("testnet"));

/**
 * Generates a new keypair and writes it to a file
 * @param outputFile The file to write the keypair to if specified
 */
export async function generateKeyPair(outputFile?: string) {
    const keypair = Keypair.generate();
    const keyDetails = {
        privateKeyString: bs58.encode(keypair.secretKey),
        privateKey: Array.from(keypair.secretKey),
        publicKeyString: keypair.publicKey.toBase58(),
        publicKey: Array.from(keypair.publicKey.toBuffer())
    };

    if (outputFile) {
        const replacer = (_: string, value: string) => {
            if (Array.isArray(value)) {
                return JSON.stringify(value);
            }
            return value;
        };
        writeFileSync(outputFile, JSON.stringify(keyDetails, replacer, 2).replace(/"\[/g, '[').replace(/\]"/g, ']').replace(/\\,/g, ','));
        console.log(`✅ Keypair written to ${outputFile}!`);
    } else {
        console.log(`✅ Private key:   ${keyDetails.privateKeyString}`);
        console.log(`✅ Public key:    ${keyDetails.publicKeyString}`);
    }
}

/**
 * Request an airdrop of SOL to a public address
 * @param to The public address to send the airdrop to
 */
export async function requestAirdrop(amount: number, to: PublicKey) {
    try {
        const airdropSignature = await connection.requestAirdrop(to, amount * LAMPORTS_PER_SOL);
        const blockhash = await connection.getLatestBlockhash();

        const confArgs: BlockheightBasedTransactionConfirmationStrategy = {
            signature: airdropSignature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        };

        const transaction = await connection.confirmTransaction(confArgs);
        console.log(`✅ Airdrop successful`);
    } catch (e) {
        console.error(`❌ Airdrop failed`);
    }
}

/**
 * Send SOL from one address to another
 * @param amount The amount of SOL to send
 * @param from The public address to send the SOL from
 * @param to The public address to send the SOL to
 */
export async function sendSol(amount: number, from: Keypair, to: PublicKey) {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: amount * LAMPORTS_PER_SOL,
            }),
        );
        const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
        console.log(`✅ Sent ${amount} SOL to ${to}`);
        console.log(`✅ Transction hash: ${signature}`);
    } catch (e) {
        console.error(`❌ Transaction failed`);
    }
}

/**
 * Get the balance of a public address
 * @param publicKey The public address to get the balance of
 */
export async function getBalance(publicKey: PublicKey) {
    try {
        const balance = await connection.getBalance(publicKey);
        console.log(`✅ Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(9)} SOL`);
    } catch (e) {
        console.error(`❌ Failed to get balance`);
    }
}

/**
 * converts a private key string to a Keypair object
 * @param privateKeyString
 * @returns 
 */
export function privateKeyStringToKeypair(privateKeyString: string): Keypair {
    const privateKeyUint8Array = bs58.decode(privateKeyString);
    return Keypair.fromSecretKey(privateKeyUint8Array);
}
