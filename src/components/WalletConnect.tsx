import React, { useState, useEffect } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import TonWeb from "tonweb";
import { Buffer } from 'buffer';
import '../styles/wallet-connect.css';

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
    <div className="my-wallet-connect">
      <span>Demo connect Ton wallet</span>
      <TonConnectButton />
      <b>Balance: {balance !== null ? `${balance} TON` : "..."}</b>
    </div>
  );
};

export default WalletConnect;
