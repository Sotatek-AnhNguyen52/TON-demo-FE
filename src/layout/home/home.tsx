import React, { useState, useEffect } from "react";
import { useAppContext } from "../../contexts/AppContext";
import "./home.css";
import WalletConnect from "../../components/WalletConnect";
import ButtonClaim from "../../components/Claim";


window.Buffer = window.Buffer || Buffer;

const Home: React.FC = () => {
  return (
    <div className="my-home">
        <WalletConnect />
        <ButtonClaim />
    </div>
  );
};

export default Home;
