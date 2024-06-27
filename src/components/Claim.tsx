import React, { useState, useEffect } from "react";
import "../styles/button.css";
import { ADD_SCORE, CELL_CODE, claimHelperAddress } from "../constant";
import {
  upScore,
  getScore,
  requestClaim,
  getRequestedClaim,
  updateIsClaimed,
} from "../service/game-service";
import useDebounce from "../hooks/use-debounce";
import {
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
  CHAIN,
} from "@tonconnect/ui-react";
import useFetchJettonBalance from "../hooks/use-fetch-jetton-balance";
import { useAppContext } from "../contexts/AppContext";
import { DeployInfo } from "../types/common";
import {
  Address,
  Cell,
  StateInit,
  beginCell,
  contractAddress,
  storeStateInit,
} from "@ton/core";
import { useClaimHelperContract } from "../hooks/useClaimHelperContract";
import { useTonClient } from "../hooks/useTonClient";

window.Buffer = window.Buffer || Buffer;

const ButtonClaim: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isRequestedClaim, setIsRequestedClaim] = useState<boolean>(false);
  const [requestingClaim, setRequestingClaim] = useState<boolean>(false);
  const [displaySuccess, setDisplaySuccess] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const debouncedPoints = useDebounce(points, 1000);
  const [deployInfo, setDeployInfo] = useState<DeployInfo>();
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const [claimHelper, setClaimHelper] = useState<string | null>(localStorage.getItem(claimHelperAddress) || null);

  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isClaiming, setIsclaiming] = useState<boolean>(false);

  const userFriendlyAddress = useTonAddress();
  const wallet = useTonWallet();
  const { shouldRefreshBalance } = useAppContext();

  const client = useTonClient();

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
    const getRequest = async () => {
      const data = await getRequestedClaim();
      console.log("🚀 ~ getRequest ~ info:", data)
      if (data && data.length > 0) {
        const info = data[0];
        setIsRequestedClaim(true);
        setDeployInfo({
          claimMaster: info.claimMaster,
          merkeleProof: info.merkleProof,
          treeIndex: info.treeIndex,
          id: info.id,
        });
      }
    };
    getRequest();
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
    const data = await requestClaim({
      to: userFriendlyAddress,
      amount: count.toString(),
    });
    if (data) {
      const scoreData = await getScore();
      setCount(Number(scoreData.value.points));
    }
    setRequestingClaim(false);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleDeploy = async () => {
    if (!deployInfo || !wallet) {
      return;
    }
    const { claimMaster, merkeleProof, treeIndex } = deployInfo;
    try {
      const masterAddress = Address.parse(claimMaster);
      const index = treeIndex;
      const proofHash = Cell.fromBoc(Buffer.from(merkeleProof, "hex"))[0];

      const payload = beginCell()
        .storeBit(false)
        .storeAddress(masterAddress)
        .storeBuffer(proofHash.hash(), 32)
        .storeUint(+index, 256)
        .endCell();

      const stateInit: StateInit = {
        code: Cell.fromBoc(Buffer.from(CELL_CODE, "hex"))[0],
        data: payload,
      }

      const stateInitBuilder = beginCell();
      storeStateInit(stateInit)(stateInitBuilder);
      const stateInitCell = stateInitBuilder.endCell();

      const helperAddress = contractAddress(0, stateInit);

      const myTransaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: helperAddress.toString(),
            amount: "150000000",
            payload: payload.toBoc().toString("base64"),
            stateInit: stateInitCell.toBoc({ idx: false }).toString("base64"),
          },
        ],
      };
      console.log("🚀 ~ handleDeploy ~ myTransaction:", myTransaction);
      setIsDeploying(true);
      await tonConnectUI.sendTransaction(myTransaction);
      if (client) {
        const checkDeployment = async () => {
          const startTime = Date.now();
          while (Date.now() - startTime < 40000) {
            const isDeployed = await client.isContractDeployed(helperAddress);
            if (isDeployed) {
              setIsDeploying(false);
              localStorage.setItem(claimHelperAddress, helperAddress.toString());
              setClaimHelper(helperAddress.toString());
              return;
            }
            await delay(5000);
          }
          throw new Error("Deployment timed out");
        };
        await checkDeployment();
      }
    } catch (error) {
      localStorage.removeItem(claimHelperAddress);
      setClaimHelper(null);
      setIsDeploying(false);
      console.error("Failed to deploy contract", error);
    }
  };
  const { sendClaim, getClaimed } = useClaimHelperContract(claimHelper);

  const handleClaim = async () => {
    if (!wallet || !claimHelper || !deployInfo) {
      return;
    }
    try {
      const { merkeleProof } = deployInfo;
      const proof = Cell.fromBoc(Buffer.from(merkeleProof, "hex"))[0];
      // const queryId = BigInt(21);
      setIsclaiming(true);
      await sendClaim(proof);
      const checkClaimed = async () => {
        const startTime = Date.now();
        while (Date.now() - startTime < 40000) {
          const claimed = await getClaimed();
          if (claimed) {
            setIsclaiming(false);
            setDisplaySuccess(true);
            const updateClaimed = await updateIsClaimed(deployInfo.id);
            if (updateClaimed) {
              localStorage.removeItem(claimHelperAddress);
              setClaimHelper(null);
            }
            setTimeout(() => {
              setDisplaySuccess(false);
              shouldRefreshBalance();
            }, 2000);
            return;
          }
          await delay(5000);
        }
        throw new Error("Claiming timed out");
      };
      await checkClaimed();
    } catch (error) {
      setIsclaiming(false);
      console.error("Failed to claim", error);
      setTransactionStatus("Failed to claim");
    }
  };

  return (
    <div className="button-container">
      <div className="my-press-button" onClick={handleClick}>
        {clicks.map((click, index) => (
          <div key={click} className="floating-plus-one">
            +{ADD_SCORE}
          </div>
        ))}
      </div>
      <b>{"Count: " + count}</b>
      {claimHelper ? (
        <div className="my-claim-button" onClick={handleClaim}>
          {isClaiming ? "Claiming..." : "Claim"}
        </div>
      ) : isRequestedClaim ? (
        <div className="my-claim-button" onClick={handleDeploy}>
          {isDeploying ? "Deploying..." : "Deploy"}
        </div>
      ) : (
        <div
          className="my-claim-button"
          onClick={() => {
            if (!requestingClaim) handleRequestClaim();
          }}
        >
          {requestingClaim ? "Requesting..." : "Request Claim"}
        </div>
      )}
       {/* {transactionStatus && (
        <div className="transaction-status">{transactionStatus}</div>
      )} */}
      {displaySuccess && (
        <div className="success-message">Successful!</div>
      )}
    </div>
  );
};

export default ButtonClaim;
