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
import { buildTransferTransaction } from "../functions/build-transfer-transaction";
import { buildCreateAssociatedTokenAccountTransaction } from "../functions/build-ATA-transaction";

import "../../styles.css";

interface TransferPageProps {
  mintPublicKey: string | null;
  setMintPublicKey: (mintPublicKey: string) => void;
  associatedAccountPublicKey: string | null;
  setAssociatedAccountPublicKey: (associatedAccountPublicKey: string) => void;
}

export const TransferPage: FC<TransferPageProps> = ({
  mintPublicKey,
  associatedAccountPublicKey,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState(0);
  const [receiverPublicKey, setReceiverPublicKey] = useState<string | null>(
    null
  );
  const [receiverValid, setReceiverValid] = useState<boolean | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const checkReceiverValid = () => {
    if (!receiverPublicKey) {
      setReceiverValid(true);
    } else if (receiverPublicKey === "") {
      setReceiverValid(false);
    } else {
      try {
        new PublicKey(receiverPublicKey);
        setReceiverValid(true);
      } catch (error) {
        setReceiverValid(false);
      }
    }
  };

  const transfer = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (
        !publicKey ||
        !mintPublicKey ||
        !associatedAccountPublicKey ||
        !receiverPublicKey
      )
        return;
      let receiver;
      try {
        receiver = new PublicKey(receiverPublicKey);
      } catch (error) {
        console.error("Invalid receiver associated account", error);
        return;
      }

      try {
        const { transaction, associatedTokenPublicKey } =
          await buildCreateAssociatedTokenAccountTransaction(
            connection,
            publicKey,
            new PublicKey(mintPublicKey)
          );
        const transferTransaction = await buildTransferTransaction(
          connection,
          new PublicKey(associatedAccountPublicKey),
          associatedTokenPublicKey,
          publicKey,
          amount * LAMPORTS_PER_SOL
        );

        const {
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(
          transferTransaction,
          connection,
          {
            signers: [],
          }
        );
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
        <form onSubmit={transfer}>
          <Typography variant="h4" gutterBottom>
            Transfer Tokens
          </Typography>
          <TextField
            error={!receiverValid}
            label="Receiver Token Account"
            helperText={receiverValid ? "" : "Please enter a valid public key"}
            type="text"
            value={receiverPublicKey}
            onChange={(e) => {
              checkReceiverValid();
              setReceiverPublicKey(e.target.value);
            }}
            fullWidth
            margin="normal"
          />
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
            Transfer
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
