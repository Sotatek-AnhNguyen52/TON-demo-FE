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
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
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
import { delay, getTonweb, refreshTokenBalance } from "../helper";

window.Buffer = window.Buffer || Buffer;

const ButtonClaim: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isRequestedClaim, setIsRequestedClaim] = useState<boolean>(false);
  const [requestingClaim, setRequestingClaim] = useState<boolean>(false);
  const [displaySuccess, setDisplaySuccess] = useState<boolean>(false);
  const debouncedPoints = useDebounce(points, 1000);
  const [deployInfo, setDeployInfo] = useState<DeployInfo>();
  const [tonConnectUI] = useTonConnectUI();
  const [claimHelper, setClaimHelper] = useState<string | null>(
    localStorage.getItem(claimHelperAddress) || null
  );

  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isClaiming, setIsclaiming] = useState<boolean>(false);

  const wallet = useTonWallet();
  const { shouldRefreshBalance } = useAppContext();
  const { sendClaim, getClaimed } = useClaimHelperContract(claimHelper);

  const client = useTonClient();

  const updateScore = async () => {
    const scoreData = await getScore();
    if (scoreData) {
      setCount(Number(scoreData.value.points));
    }
  };

  useEffect(() => {
    const fetchInitialScore = async () => {
      try {
        updateScore();
      } catch (error) {
        console.error("Failed to fetch initial score", error);
      }
    };

    fetchInitialScore();
  }, []);

  useEffect(() => {
    const getRequest = async () => {
      const data = await getRequestedClaim();
      console.log("🚀 ~ getRequest ~ info:", data);
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
      const saveScores = async () => {
        try {
          await upScore({ points: debouncedPoints, remaining_energy: 123234 });
          console.log("updated!");
          updateScore();
        } catch (error) {
          console.error("Failed to update score", error);
        }
      };

      saveScores();
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
    if (count === 0 || !wallet) {
      return;
    }
    setRequestingClaim(true);
    const data = await requestClaim({
      to: wallet.account.address,
      amount: count.toString(),
    });
    if (data) {
      updateScore();
    }
    setRequestingClaim(false);
  };

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
      };

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
            console.log("🚀 ~ checkDeployment ~ isDeployed:", isDeployed);
            if (isDeployed) {
              setIsDeploying(false);
              localStorage.setItem(
                claimHelperAddress,
                helperAddress.toString()
              );
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

  const handleClaim = async () => {
    if (!wallet || !claimHelper || !deployInfo) {
      return;
    }
    try {
      const { merkeleProof } = deployInfo;
      const proof = Cell.fromBoc(Buffer.from(merkeleProof, "hex"))[0];
      setIsclaiming(true);

      const lastTx = (
        await getTonweb().getTransactions(wallet.account.address, 1)
      )[0];
      const lastTxHash = lastTx.transaction_id.hash;

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
              setIsRequestedClaim(false);
            }
            refreshTokenBalance(
              wallet.account.address,
              lastTxHash,
              shouldRefreshBalance
            );
            setTimeout(() => {
              setDisplaySuccess(false);
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
        <div
          className="my-claim-button"
          onClick={() => {
            if (!isClaiming) handleClaim();
          }}
        >
          {isClaiming ? "Claiming..." : "Claim"}
        </div>
      ) : isRequestedClaim ? (
        <div
          className="my-claim-button"
          onClick={() => {
            if (!isDeploying) handleDeploy();
          }}
        >
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
      {displaySuccess && <div className="success-message">Successful!</div>}
    </div>
  );
};

export default ButtonClaim;
