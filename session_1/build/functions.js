"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeyPair = generateKeyPair;
exports.requestAirdrop = requestAirdrop;
exports.sendSol = sendSol;
exports.getBalance = getBalance;
exports.privateKeyStringToKeypair = privateKeyStringToKeypair;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const fs_1 = require("fs");
let connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("testnet"));
/**
 * Generates a new keypair and writes it to a file
 * @param outputFile The file to write the keypair to if specified
 */
function generateKeyPair(outputFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const keypair = web3_js_1.Keypair.generate();
        const keyDetails = {
            privateKeyString: bs58_1.default.encode(keypair.secretKey),
            privateKey: Array.from(keypair.secretKey),
            publicKeyString: keypair.publicKey.toBase58(),
            publicKey: Array.from(keypair.publicKey.toBuffer())
        };
        if (outputFile) {
            const replacer = (_, value) => {
                if (Array.isArray(value)) {
                    return JSON.stringify(value);
                }
                return value;
            };
            (0, fs_1.writeFileSync)(outputFile, JSON.stringify(keyDetails, replacer, 2).replace(/"\[/g, '[').replace(/\]"/g, ']').replace(/\\,/g, ','));
            console.log(`✅ Keypair written to ${outputFile}!`);
        }
        else {
            console.log(`✅ Private key:   ${keyDetails.privateKeyString}`);
            console.log(`✅ Public key:    ${keyDetails.publicKeyString}`);
        }
    });
}
/**
 * Request an airdrop of SOL to a public address
 * @param to The public address to send the airdrop to
 */
function requestAirdrop(amount, to) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const airdropSignature = yield connection.requestAirdrop(to, amount * web3_js_1.LAMPORTS_PER_SOL);
            const blockhash = yield connection.getLatestBlockhash();
            const confArgs = {
                signature: airdropSignature,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            };
            const transaction = yield connection.confirmTransaction(confArgs);
            console.log(`✅ Airdrop successful`);
        }
        catch (e) {
            console.error(`❌ Airdrop failed`);
        }
    });
}
/**
 * Send SOL from one address to another
 * @param amount The amount of SOL to send
 * @param from The public address to send the SOL from
 * @param to The public address to send the SOL to
 */
function sendSol(amount, from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: amount * web3_js_1.LAMPORTS_PER_SOL,
            }));
            const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [from]);
            console.log(`✅ Sent ${amount} SOL to ${to}`);
            console.log(`✅ Transction hash: ${signature}`);
        }
        catch (e) {
            console.error(`❌ Transaction failed`);
        }
    });
}
/**
 * Get the balance of a public address
 * @param publicKey The public address to get the balance of
 */
function getBalance(publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield connection.getBalance(publicKey);
            console.log(`✅ Balance: ${(balance / web3_js_1.LAMPORTS_PER_SOL).toFixed(9)} SOL`);
        }
        catch (e) {
            console.error(`❌ Failed to get balance`);
        }
    });
}
/**
 * converts a private key string to a Keypair object
 * @param privateKeyString
 * @returns
 */
function privateKeyStringToKeypair(privateKeyString) {
    const privateKeyUint8Array = bs58_1.default.decode(privateKeyString);
    return web3_js_1.Keypair.fromSecretKey(privateKeyUint8Array);
}
