import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  Connection,
  Signer,
} from "@solana/web3.js";
import {
  createSetAuthorityInstruction,
  TOKEN_PROGRAM_ID,
  AuthorityType,
} from "@solana/spl-token";

export const buildSetAuthorityTransaction = async (
  connection: Connection,
  payer: PublicKey,
  account: PublicKey,
  currentAuthorityPublicKey: PublicKey,
  authorityType: AuthorityType,
  newAuthority: PublicKey,
  multiSigners: Signer[] = []
): Promise<VersionedTransaction> => {
  const instructions = [
    createSetAuthorityInstruction(
      account,
      currentAuthorityPublicKey,
      authorityType,
      newAuthority,
      multiSigners,
      TOKEN_PROGRAM_ID
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

  return transaction;
};
