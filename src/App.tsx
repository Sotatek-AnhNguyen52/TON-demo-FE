import React from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { AppProvider } from "./contexts/AppContext";
import Home from "./layout/home/home";


const App: React.FC = () => {
  return (
    <TonConnectUIProvider manifestUrl="http://localhost:3000/tonconnect-manifest.json">
      <AppProvider>
        <div className="App">
          <Home />
        </div>
      </AppProvider>
    </TonConnectUIProvider>
  );
};

export default App;