import React, { useEffect } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { AppProvider } from "./contexts/AppContext";
import Home from "./layout/home";
import useGlobalErrorHandler from "./hooks/useGlobalErrorHandler";

const App: React.FC = () => {
  useGlobalErrorHandler();

  return (
    <TonConnectUIProvider manifestUrl="https://ton-demo.sotatek.works/tonconnect-manifest.json">
      <AppProvider>
        <div className="App">
          <Home />
        </div>
      </AppProvider>
    </TonConnectUIProvider>
  );
};

export default App;
