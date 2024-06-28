import React, { useState, useEffect, useMemo } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import TonWeb from "tonweb";
import { Buffer } from "buffer";
import "../styles/wallet-connect.css";
import { useAppContext } from "../contexts/AppContext";
import { fetchData } from "../service/token-service";

const BN = TonWeb.utils.BN;

window.Buffer = window.Buffer || Buffer;

const WalletConnect: React.FC = () => {
  const { userInfo } = useAppContext();
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
  const [tokenDecimal, setTokenDecimal] = useState<string | null>(null);

  const { balance, metadata } = useAppContext();

  useEffect(() => {
    if (!metadata) {
      return;
    }
    const fetchTokenInfo = async () => {
      const tokenInfo = await fetchData(metadata);
      if (tokenInfo) {
        setTokenSymbol(tokenInfo.symbol);
        setTokenDecimal(tokenInfo.decimals);
      }
    };
    fetchTokenInfo();
  }, [metadata]);

  const realBalance = useMemo(() => {
    if (!balance || !tokenDecimal) {
      return null;
    }
    
    const decimal = new BN(tokenDecimal);
    const divisor = new BN(10).pow(decimal);
    const bal = new BN(balance);
    
    const integerPart = bal.div(divisor);
    const fractionalPart = bal.mod(divisor).toString().padStart(decimal.toNumber(), '0');
  
    return `${integerPart.toString()}.${fractionalPart}`;
  }, [balance, tokenDecimal]);

  return (
    <div className="my-wallet-connect">
      <span>User: {userInfo ? userInfo.username : "..."}</span>
      <TonConnectButton />
      <b>
        Balance:{" "}
        {realBalance !== null
          ? `${realBalance} ${tokenSymbol ? tokenSymbol : ""}`
          : "..."}
      </b>
    </div>
  );
};

export default WalletConnect;
