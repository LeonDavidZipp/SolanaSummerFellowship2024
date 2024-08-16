import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";
import { createMintToInstruction } from "@solana/spl-token";

export const buildMintToTransaction = async (
  connection: Connection,
  authority: PublicKey,
  mint: PublicKey,
  amount: number,
  destination: PublicKey
): Promise<VersionedTransaction> => {
  const instructions = [
    createMintToInstruction(mint, destination, authority, amount),
  ];

  const {
    value: { blockhash },
  } = await connection.getLatestBlockhashAndContext();

  const messagev0 = new TransactionMessage({
    payerKey: authority,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messagev0);

  return transaction;
};
