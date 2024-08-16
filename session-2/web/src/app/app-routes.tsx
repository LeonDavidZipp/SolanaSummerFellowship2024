import { useState } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { HomePage } from "./pages/home-page";
import { CreateMintPage } from "./pages/create-mint-and-ATA";
import { MintPage } from "./pages/mint";
import { TransferPage } from "./pages/transfer";
import { BurnPage } from "./pages/burn";
import { ChangeAuthorityPage } from "./pages/change-authority";

export function AppRoutes() {
  const [mintPublicKey, setMintPublicKey] = useState<string | null>(null);
  const [associatedAccountPublicKey, setAssociatedAccountPublicKey] = useState<
    string | null
  >(null);
  return useRoutes([
    { index: true, element: <Navigate replace to="/home" /> },
    {
      path: "/home",
      element: <HomePage />,
    },
    {
      path: "/createMint",
      element: (
        <CreateMintPage
          mintPublicKey={mintPublicKey}
          setMintPublicKey={setMintPublicKey}
          associatedAccountPublicKey={associatedAccountPublicKey}
          setAssociatedAccountPublicKey={setAssociatedAccountPublicKey}
        />
      ),
    },
    {
      path: "/mint",
      element: (
        <MintPage
          mintPublicKey={mintPublicKey}
          setMintPublicKey={setMintPublicKey}
          associatedAccountPublicKey={associatedAccountPublicKey}
          setAssociatedAccountPublicKey={setAssociatedAccountPublicKey}
        />
      ),
    },
    {
      path: "/transfer",
      element: (
        <TransferPage
          mintPublicKey={mintPublicKey}
          setMintPublicKey={setMintPublicKey}
          associatedAccountPublicKey={associatedAccountPublicKey}
          setAssociatedAccountPublicKey={setAssociatedAccountPublicKey}
        />
      ),
    },
    {
      path: "/burn",
      element: (
        <BurnPage
          mintPublicKey={mintPublicKey}
          setMintPublicKey={setMintPublicKey}
          associatedAccountPublicKey={associatedAccountPublicKey}
          setAssociatedAccountPublicKey={setAssociatedAccountPublicKey}
        />
      ),
    },
    {
      path: "/changeAuthority",
      element: (
        <ChangeAuthorityPage
          mintPublicKey={mintPublicKey}
          setMintPublicKey={setMintPublicKey}
          associatedAccountPublicKey={associatedAccountPublicKey}
          setAssociatedAccountPublicKey={setAssociatedAccountPublicKey}
        />
      ),
    },
  ]);
}
