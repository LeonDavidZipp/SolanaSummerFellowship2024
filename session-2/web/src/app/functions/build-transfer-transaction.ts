import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";
import { createTransferInstruction } from "@solana/spl-token";

export const buildTransferTransaction = async (
  connection: Connection,
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number
): Promise<VersionedTransaction> => {
  const instructions = [
    createTransferInstruction(source, destination, owner, amount),
  ];

  const {
    value: { blockhash },
  } = await connection.getLatestBlockhashAndContext();

  const messagev0 = new TransactionMessage({
    payerKey: owner,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messagev0);

  return transaction;
};
