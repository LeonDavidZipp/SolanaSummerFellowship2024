import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

export const TokenAppBar = () => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Link to="/">
          <IconButton>
            <HomeIcon />
          </IconButton>
        </Link>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
          }}
        >
          Token Minting Program
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Link to="/createMint">
            <Button variant="contained" color="primary">
              Create Mint
            </Button>
          </Link>
          <Link to="/mint">
            <Button variant="contained" color="primary">
              Mint Token
            </Button>
          </Link>
          <Link to="/transfer">
            <Button variant="contained" color="primary">
              Transfer Token
            </Button>
          </Link>
          <Link to="/burn">
            <Button variant="contained" color="primary">
              Burn Token
            </Button>
          </Link>
          <Link to="/changeAuthority">
            <Button variant="contained" color="primary">
              Change Authority
            </Button>
          </Link>
          <WalletMultiButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
