import {
  PublicKey,
  Signer,
  TransactionMessage,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";
import { createBurnInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const getSigners = (
  signerOrMultisig: Signer | PublicKey,
  multiSigners: Signer[]
): [PublicKey, Signer[]] => {
  return signerOrMultisig instanceof PublicKey
    ? [signerOrMultisig, multiSigners]
    : [signerOrMultisig.publicKey, [signerOrMultisig]];
};

export const buildBurnTransaction = async (
  connection: Connection,
  authority: PublicKey,
  account: PublicKey,
  mint: PublicKey,
  amount: number,
  multiSigners: Signer[] = []
): Promise<VersionedTransaction> => {
  const [ownerPublicKey, signers] = getSigners(authority, multiSigners);
  const instructions = [
    createBurnInstruction(
      account,
      mint,
      ownerPublicKey,
      amount,
      multiSigners,
      TOKEN_PROGRAM_ID
    ),
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
