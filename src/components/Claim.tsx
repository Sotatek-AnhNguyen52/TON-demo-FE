import React, { useState, useEffect } from "react";
import "../styles/button.css";
import { ADD_SCORE } from "../constant";
import { upScore, getScore, requestClaim, getRequestedClaim } from "../service/game-service";
import useDebounce from "../hooks/use-debounce";
import { useTonAddress, useTonConnectUI, useTonWallet, CHAIN } from "@tonconnect/ui-react";
import useFetchJettonBalance from "../hooks/use-fetch-jetton-balance";
import { useAppContext } from "../contexts/AppContext";
import { DeployInfo } from "../types/common";
import { Address, Cell, StateInit, beginCell, contractAddress } from '@ton/core';

window.Buffer = window.Buffer || Buffer;

const ButtonClaim: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isRequestedClaim, setIsRequestedClaim] = useState<boolean>(false);
  const [requestingClaim, setRequestingClaim] = useState<boolean>(false);
  const [displaySuccess, setDisplaySuccess] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const debouncedPoints = useDebounce(points, 1000);
  const [deployInfo, setDeployInfo] = useState<DeployInfo>();
  const [tonConnectUI, setOptions] = useTonConnectUI();

  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();
  const { shouldRefreshBalance } = useAppContext();

  useEffect(() => {
    const fetchInitialScore = async () => {
      try {
        const scoreData = await getScore();
        setCount(Number(scoreData.value.points));
      } catch (error) {
        console.error("Failed to fetch initial score", error);
      }
    };

    fetchInitialScore();
  }, []);

  useEffect(() => {
    setIsRequestedClaim(true);
    setDeployInfo({
      claimMaster: "EQAldAVF6okeV1qqxuSAdkQHd2O0RR74CtW9W4qqR1B6rYsq",
      merkeleProof: "b5ee9c724101060100a600094603fbae0a795bb020b62c5184f18fad5821596e5e1d260718ecaee2480a43dfd79d0002012203cfe803022848010195f0aa0bd824bfbf21b16a93308768bd9b5f9fa3f141a5a07ffb94d80b0302a60000220120050428480101f609f62ae22c60d42e44b77d948dd131f43965611d4f1ae814a768d4df4f98f90000004d2002f04fa961808c8c0e51ffe862060377ecf162e995734ed64979033922f2d70792049e8e6040a4d433df",
      treeIndex: "0",
      amount: "1550",
    })
    // const getRequest = async () => {
    //   const data = await getRequestedClaim();
    //   if (data && data.length > 0) {
    //     const info = data[0];
    //     setDeployInfo({
    //       claimMaster: info.claimMaster,
    //       merkeleProof: info.merkleProof,
    //       treeIndex: info.treeIndex,
    //       amount: info.amount,
    //     });
    //   }
    // };
    // getRequest();
  }, [requestingClaim]);

  useEffect(() => {
    if (debouncedPoints > 0) {
      const updateScore = async () => {
        try {
          await upScore({ points: debouncedPoints, remaining_energy: 123234 });
          console.log("updated!");
          const scoreData = await getScore();
          setCount(Number(scoreData.value.points));
        } catch (error) {
          console.error("Failed to update score", error);
        }
      };

      updateScore();
    }
  }, [debouncedPoints]);

  const increment = () => {
    const newCount = count + ADD_SCORE;
    setCount(newCount);
    setPoints(newCount);
  };

  const handleClick = () => {
    increment();
    const newClick = Date.now();
    setClicks([...clicks, newClick]);
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click !== newClick)
      );
    }, 1000);
  };

  const handleRequestClaim = async () => {
    if (count === 0 || !userFriendlyAddress) {
      return;
    }
    setRequestingClaim(true);
    const data = await requestClaim({ to: userFriendlyAddress, amount: count.toString() });
    setRequestingClaim(false);
  };

  const handleDeploy = async () => {
    if (!deployInfo || !wallet) {
      return;
    }
    const { claimMaster, merkeleProof, treeIndex } = deployInfo;

    const cellCode = "b5ee9c7241010701008a000114ff00f4a413f4bcf2c80b01020120040201bef26c2101821005f5e100bef2e2c0ed44d0d20001f2d2be88ed54fa40d3ffd3ff3003d33fd43020f9005003baf2e2c1f800820afaf08070fb02821043c7d5c9c8cb1fcb3fcc12cbffc9718010c8cb055003cf1670fa0212cb6accc98306fb00030001c002014806050011a098d7da89a1ae14010002d0289d180d";

    try {
        const masterAddress = Address.parse(claimMaster);
        const index = treeIndex;
        const proofHash = Cell.fromBoc(
          Buffer.from(merkeleProof, 'hex')
        )[0];

        const stateInit = Buffer.from(cellCode, 'hex').toString('base64')

        const payload = beginCell()
          .storeBit(false)
          .storeAddress(masterAddress)
          .storeBuffer(proofHash.hash(), 32)
          .storeUint(+index, 256)
          .endCell();

        const helperAddress = contractAddress(0, {
          code: Cell.fromBoc(Buffer.from(cellCode, 'hex'))[0],
          data: payload
        });        

      const myTransaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, 
        messages: [
          {
            address: helperAddress.toString(),
            amount: "150000000",
            payload: payload.toBoc().toString('base64'),
            // stateInit: stateInit
          }
        ]
      }
      tonConnectUI.sendTransaction(myTransaction)
      console.log("🚀 ~ handleDeploy ~ transaction:", myTransaction)


      setTransactionStatus('Waiting for confirmation...');

      // const someTxData = await myAppExplorerService.getTransaction(result.boc);

      // const txHash = transaction.id;
      // let confirmed = false;
      // while (!confirmed) {
      //   const status = await wallet.getTransactionStatus(txHash);
      //   if (status.confirmed) {
      //     confirmed = true;
      //     setTransactionStatus('Transaction confirmed!');
      //     setDisplaySuccess(true);
      //     setTimeout(() => setDisplaySuccess(false), 3000);
      //   } else {
      //     await new Promise(resolve => setTimeout(resolve, 1000));
      //   }
      // }
    } catch (error) {
      console.error("Failed to deploy contract", error);
      setTransactionStatus('Failed to deploy contract');
    }
  };

  return (
    <div className="button-container">
      <div className="my-press-button" onClick={handleClick}>
        {clicks.map((click, index) => (
          <div
            key={click}
            className="floating-plus-one"
          >
            +{ADD_SCORE}
          </div>
        ))}
      </div>
      <b>{"Count: " + count}</b>
      {
        isRequestedClaim ? <div className="my-claim-button" onClick={handleDeploy}>Deploy</div> :
          <div
            className="my-claim-button"
            onClick={() => {
              if (!requestingClaim) handleRequestClaim();
            }}
          >
            {requestingClaim ? "Requesting..." : "Request Claim"}
          </div>
      }
      {transactionStatus && <div className="transaction-status">{transactionStatus}</div>}
      {displaySuccess && <div className="success-message">Deployment Successful!</div>}
    </div>
  );
};

export default ButtonClaim;
