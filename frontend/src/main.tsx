import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WalletProvider } from "./components/wallet-provider.tsx";
import { ReactQueryProvider } from "./components/react-query-provider.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import App from "./App.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider>
      <ReactQueryProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ReactQueryProvider>
    </WalletProvider>
  </StrictMode>
);
