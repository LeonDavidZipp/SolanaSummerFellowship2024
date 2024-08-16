import { FC, useCallback, useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Button,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { buildMintToTransaction } from "../functions/build-mint-to-transaction";

import "../../styles.css";

interface CreateMintPageProps {
  mintPublicKey: string | null;
  setMintPublicKey: (mintPublicKey: string) => void;
  associatedAccountPublicKey: string | null;
  setAssociatedAccountPublicKey: (associatedAccountPublicKey: string) => void;
}

export const MintPage: FC<CreateMintPageProps> = ({
  mintPublicKey,
  associatedAccountPublicKey,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const createMint = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!publicKey || !mintPublicKey || !associatedAccountPublicKey) return;

      try {
        const transaction = await buildMintToTransaction(
          connection,
          publicKey,
          new PublicKey(mintPublicKey),
          amount * LAMPORTS_PER_SOL,
          new PublicKey(associatedAccountPublicKey)
        );

        const {
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, {
          signers: [],
        });
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature,
        });

        setTransactionHash(signature);
      } catch (error) {
        console.error("Transaction failed", error);
      }
    },
    [connection, publicKey, mintPublicKey, amount, associatedAccountPublicKey]
  );

  return (
    <Stack spacing={1} padding={1} direction="column" className="InputForm">
      {mintPublicKey == null || associatedAccountPublicKey === null ? (
        <TextField
          value={"Please first create or load a mint"}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
        />
      ) : transactionHash === null ? (
        <form onSubmit={createMint}>
          <Typography variant="h4" gutterBottom>
            Mint Token
          </Typography>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (n < 0) return;
              setAmount(n);
            }}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit">
            Mint
          </Button>
        </form>
      ) : (
        <TextField
          label="Transaction Hash"
          value={transactionHash}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(transactionHash);
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      )}
    </Stack>
  );
};
