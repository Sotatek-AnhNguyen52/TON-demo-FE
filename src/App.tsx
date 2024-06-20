import React, { useEffect } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { AppProvider } from "./contexts/AppContext";
import Home from "./layout/home";

const App: React.FC = () => {
  useEffect(() => {
    try {
      if (typeof (window as any).TelegramGameProxy !== "undefined") {
        (window as any).TelegramGameProxy.receiveEvent(
          "event_name",
          "event_data"
        );
      } else {
        console.error("TelegramGameProxy is not defined");
      }
    } catch (error) {
      console.error("Caught error:", error);
    }
  }, []);

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
