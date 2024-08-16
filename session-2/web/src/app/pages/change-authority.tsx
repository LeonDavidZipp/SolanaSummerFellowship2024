import { FC, useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AuthorityType } from "@solana/spl-token";
import {
  Button,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { buildSetAuthorityTransaction } from "../functions/build-set-authority-transaction";

import "../../styles.css";

interface ChangeAuthorityPageProps {
  mintPublicKey: string | null;
  setMintPublicKey: (mintPublicKey: string) => void;
  associatedAccountPublicKey: string | null;
  setAssociatedAccountPublicKey: (associatedAccountPublicKey: string) => void;
}

export const ChangeAuthorityPage: FC<ChangeAuthorityPageProps> = ({
  mintPublicKey,
  associatedAccountPublicKey,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [newAuthority, setNewAuthority] = useState<string | null>(null);
  const [newAuthorityValid, setNewAuthorityValid] = useState<boolean | null>(
    null
  );
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const checkNewAuthorityValid = () => {
    if (!newAuthority) {
      setNewAuthorityValid(true);
    } else if (newAuthority === "") {
      setNewAuthorityValid(false);
    } else {
      try {
        new PublicKey(newAuthority);
        setNewAuthorityValid(true);
      } catch (error) {
        setNewAuthorityValid(false);
      }
    }
  };

  const changeAuthority = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (
        !publicKey ||
        !mintPublicKey ||
        !associatedAccountPublicKey ||
        !newAuthority
      )
        return;

      try {
        const transaction = await buildSetAuthorityTransaction(
          connection,
          publicKey,
          new PublicKey(associatedAccountPublicKey),
          publicKey,
          AuthorityType.AccountOwner,
          new PublicKey(newAuthority),
          []
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
    [
      connection,
      publicKey,
      mintPublicKey,
      newAuthority,
      associatedAccountPublicKey,
    ]
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
        <form onSubmit={changeAuthority}>
          <Typography variant="h4" gutterBottom>
            Set Authority
          </Typography>
          <TextField
            error={!newAuthorityValid}
            helperText={newAuthorityValid ? "" : "Invalid authority public key"}
            label="New Authority"
            type="text"
            value={newAuthority}
            onChange={(e) => {
              checkNewAuthorityValid();
              setNewAuthority(e.target.value);
            }}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit">
            Confirm
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
