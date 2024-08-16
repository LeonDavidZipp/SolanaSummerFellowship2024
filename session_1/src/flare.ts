#! /usr/bin/env node
import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import {
    generateKeyPair, requestAirdrop,
    sendSol, getBalance, privateKeyStringToKeypair
} from "./functions";

const program = new Command();

program
    .command('generate')
    .description('Generate a new keypair')
    .option('-o, --outfile <file>', 'Output file')
    .action((options: { output?: string }) => {
        generateKeyPair(options.output);
    });

program
    .command('airdrop')
    .description('Request an airdrop')
    .requiredOption('-a, --amount <amount>', 'Amount of SOL to request')
    .requiredOption('-r, --receiver <receiverPublicKey>', 'Public key of the receiver')
    .action((amount: string, receiverPublicKeyString: string) => {
        let amnt;
        let publicKey;
        try {
            publicKey = new PublicKey(receiverPublicKeyString);
        } catch (e) {
            console.error('❌ Invalid public key');
            process.exit(1);
        }
        try {
            amnt = Number(amount);
        } catch (e) {
            console.error('❌ Invalid amount');
            process.exit(1);
        }
        requestAirdrop(amnt, publicKey);
    });

program
    .command('send')
    .description('Send SOL')
    .requiredOption('-a, --amount <amount>', 'Amount of SOL to send')
    .requiredOption('-s, --sender <senderPrivateKey>', 'Private key of the sender')
    .requiredOption('-r, --receiver <receiverPublicKey>', 'Public key of the receiver')
    .action((options: { amount: string, senderPrivateKey: string, receiverPublicKey: string }) => {
        const { amount, senderPrivateKey, receiverPublicKey } = options;
        let amnt;
        let sPK;
        let rPK;
        try {
            amnt = Number(amount);
        } catch (e) {
            console.error('❌ Invalid amount');
            process.exit(1);
        }
        try {
            sPK = privateKeyStringToKeypair(senderPrivateKey);
        } catch (e) {
            console.error('❌ Invalid private key');
            process.exit(1);
        }
        try {
            rPK = new PublicKey(receiverPublicKey);
        } catch (e) {
            console.error('❌ Invalid public key');
            process.exit(1);
        }
        sendSol(amnt, sPK, rPK);
    });

program
    .command('balance <publicKey>')
    .description('Get balance of a wallet associated with a public key')
    .action((publicKey: string) => {
        let pK;
        try {
            pK = new PublicKey(publicKey);
        } catch (e) {
            console.error('❌ Invalid public key');
            process.exit(1);
        }
        getBalance(pK);
    });

program.parse(process.argv);
