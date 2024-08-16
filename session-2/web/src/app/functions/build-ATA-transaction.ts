import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

export const buildCreateAssociatedTokenAccountTransaction = async (
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey
): Promise<{
  transaction: VersionedTransaction;
  associatedTokenPublicKey: PublicKey;
}> => {
  const associatedTokenPublicKey = await getAssociatedTokenAddress(
    mint,
    payer,
    false
  );

  const instructions = [
    createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenPublicKey,
      payer,
      mint
    ),
  ];

  const {
    value: { blockhash },
  } = await connection.getLatestBlockhashAndContext();

  const messagev0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messagev0);

  return { transaction, associatedTokenPublicKey };
};
