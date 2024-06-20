import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import "../styles/home.css";
import WalletConnect from "../components/WalletConnect";
import ButtonClaim from "../components/ButtonClaim";


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
