import { FC, useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
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
import { buildCreateMintTransaction } from "../functions/build-mint-transaction";
import { buildCreateAssociatedTokenAccountTransaction } from "../functions/build-ATA-transaction";

import "../../styles.css";

interface CreateMintPageProps {
  mintPublicKey: string | null;
  setMintPublicKey: (mintPublicKey: string) => void;
  associatedAccountPublicKey: string | null;
  setAssociatedAccountPublicKey: (associatedAccountPublicKey: string) => void;
}

export const CreateMintPage: FC<CreateMintPageProps> = ({
  mintPublicKey,
  setMintPublicKey,
  associatedAccountPublicKey,
  setAssociatedAccountPublicKey,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [decimals, setDecimals] = useState(0);
  const [manualMintPublicKey, setManualMintPublicKey] = useState<string | null>(
    null
  );

  const createMint = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!publicKey) return;

      try {
        const { transaction, mintKeypair } = await buildCreateMintTransaction(
          connection,
          publicKey,
          decimals
        );

        const {
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, {
          signers: [mintKeypair],
        });
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature,
        });
        setMintPublicKey(mintKeypair.publicKey.toBase58());
      } catch (error) {
        console.error("Transaction failed or was rejected by the user:", error);
      }
    },
    [publicKey, connection, sendTransaction, decimals, setMintPublicKey]
  );

  const createAssociatedAccount = useCallback(async () => {
    if (!mintPublicKey || !publicKey) return;

    try {
      const { transaction, associatedTokenPublicKey: tokenAccountPublicKey } =
        await buildCreateAssociatedTokenAccountTransaction(
          connection,
          publicKey,
          new PublicKey(mintPublicKey)
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

      setAssociatedAccountPublicKey(tokenAccountPublicKey.toBase58());
    } catch (error) {
      console.error("Transaction failed or was rejected by the user:", error);
    }
  }, [mintPublicKey, setAssociatedAccountPublicKey]);

  return (
    <Stack spacing={1} padding={1} direction="column" className="InputForm">
      {mintPublicKey == null ? (
        <form onSubmit={createMint}>
          <Typography variant="h4" gutterBottom>
            Create Mint
          </Typography>
          <Stack spacing={1} direction="row">
            <TextField
              label="Decimals"
              type="number"
              value={decimals}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n < 0 || n > 9) return;
                setDecimals(n);
              }}
              fullWidth
              margin="normal"
              sx={{
                flexGrow: 1,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ flexGrow: 1 }}
            >
              Create
            </Button>
          </Stack>
          <Typography variant="h5" gutterBottom>
            or load existing one
          </Typography>
          <Stack spacing={1} direction="row">
            <TextField
              label="Mint Public Key"
              type="text"
              value={manualMintPublicKey || ""}
              onChange={(e) => {
                setManualMintPublicKey(e.target.value);
              }}
              fullWidth
              margin="normal"
              sx={{
                flexGrow: 1,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{
                flexGrow: 1,
              }}
              onClick={() => {
                if (manualMintPublicKey) {
                  try {
                    new PublicKey(manualMintPublicKey);
                    setMintPublicKey(manualMintPublicKey);
                  } catch (error) {
                    console.error("Invalid mint public key:", error);
                  }
                }
              }}
            >
              Load
            </Button>
          </Stack>
        </form>
      ) : (
        <>
          <TextField
            label="Mint Public Key"
            value={mintPublicKey}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(mintPublicKey);
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />

          {associatedAccountPublicKey === null ? (
            <Button
              variant="contained"
              color="primary"
              sx={{
                flexGrow: 1,
              }}
              onClick={createAssociatedAccount}
            >
              Create ATA
            </Button>
          ) : (
            <TextField
              label="ATA Public Key"
              value={associatedAccountPublicKey}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(
                          associatedAccountPublicKey
                        );
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </>
      )}
    </Stack>
  );
};
