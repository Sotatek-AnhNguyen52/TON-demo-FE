import React, { useState, useEffect } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import TonWeb from "tonweb";
import { Buffer } from 'buffer';

window.Buffer = window.Buffer || Buffer;

const WalletConnect: React.FC = () => {
  const [balance, setBalance] = useState<string | null>(null);
  const wallet = useTonWallet();

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet) {
        try {
          const tonweb = new TonWeb();
          const balance = await tonweb.getBalance(wallet.account.address);
          setBalance(TonWeb.utils.fromNano(balance));
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [wallet]);
  

  return (
    <div style={{ justifyContent: "center", alignItems: "center", marginTop: "100px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <span>Demo connect Ton wallet</span>
      <TonConnectButton />
      <h1>Balance: {balance !== null ? `${balance} TON` : "Loading..."}</h1>
    </div>
  );
};

export default WalletConnect;
