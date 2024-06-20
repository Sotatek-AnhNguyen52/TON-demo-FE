import React from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import WalletConnect from "./components/WalletConnect";

const App: React.FC = () => {
  return (
    <TonConnectUIProvider manifestUrl="http://localhost:3000/tonconnect-manifest.json">
      <div className="App">
        <header className="App-header">
          <WalletConnect />
        </header>
      </div>
    </TonConnectUIProvider>
  );
};

export default App;
