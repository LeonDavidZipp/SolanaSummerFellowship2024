import { ReactNode } from "react";
import { TokenAppBar } from "./components/token-app-bar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TokenAppBar />
      <div style={{ flexGrow: 1, padding: "6px" }}>{children}</div>
    </div>
  );
}
