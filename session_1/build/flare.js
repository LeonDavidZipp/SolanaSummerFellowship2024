#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const web3_js_1 = require("@solana/web3.js");
const functions_1 = require("./functions");
const program = new commander_1.Command();
program
    .command('generate')
    .description('Generate a new keypair')
    .option('-o, --outfile <file>', 'Output file')
    .action((options) => {
    (0, functions_1.generateKeyPair)(options.output);
});
program
    .command('airdrop')
    .description('Request an airdrop')
    .requiredOption('-a, --amount <amount>', 'Amount of SOL to request')
    .requiredOption('-r, --receiver <receiverPublicKey>', 'Public key of the receiver')
    .action((amount, receiverPublicKeyString) => {
    let amnt;
    let publicKey;
    try {
        publicKey = new web3_js_1.PublicKey(receiverPublicKeyString);
    }
    catch (e) {
        console.error('❌ Invalid public key');
        process.exit(1);
    }
    try {
        amnt = Number(amount);
    }
    catch (e) {
        console.error('❌ Invalid amount');
        process.exit(1);
    }
    (0, functions_1.requestAirdrop)(amnt, publicKey);
});
program
    .command('send')
    .description('Send SOL')
    .requiredOption('-a, --amount <amount>', 'Amount of SOL to send')
    .requiredOption('-s, --sender <senderPrivateKey>', 'Private key of the sender')
    .requiredOption('-r, --receiver <receiverPublicKey>', 'Public key of the receiver')
    .action((options) => {
    const { amount, senderPrivateKey, receiverPublicKey } = options;
    let amnt;
    let sPK;
    let rPK;
    try {
        amnt = Number(amount);
    }
    catch (e) {
        console.error('❌ Invalid amount');
        process.exit(1);
    }
    try {
        sPK = (0, functions_1.privateKeyStringToKeypair)(senderPrivateKey);
    }
    catch (e) {
        console.error('❌ Invalid private key');
        process.exit(1);
    }
    try {
        rPK = new web3_js_1.PublicKey(receiverPublicKey);
    }
    catch (e) {
        console.error('❌ Invalid public key');
        process.exit(1);
    }
    (0, functions_1.sendSol)(amnt, sPK, rPK);
});
program
    .command('balance <publicKey>')
    .description('Get balance of a wallet associated with a public key')
    .action((publicKey) => {
    let pK;
    try {
        pK = new web3_js_1.PublicKey(publicKey);
    }
    catch (e) {
        console.error('❌ Invalid public key');
        process.exit(1);
    }
    (0, functions_1.getBalance)(pK);
});
program.parse(process.argv);
