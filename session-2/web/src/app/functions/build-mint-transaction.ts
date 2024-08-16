import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

export const buildCreateMintTransaction = async (
  connection: Connection,
  payer: PublicKey,
  decimals: number
): Promise<{ transaction: VersionedTransaction; mintKeypair: Keypair }> => {
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const accountKeypair = Keypair.generate();
  const programID = TOKEN_PROGRAM_ID;

  const instructions = [
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: accountKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: programID,
    }),
    createInitializeMint2Instruction(
      accountKeypair.publicKey,
      decimals,
      payer,
      payer,
      programID
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

  return { transaction, mintKeypair: accountKeypair };
};
