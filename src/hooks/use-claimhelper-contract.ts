import { useEffect, useState } from "react";
import { ClaimHelper } from "../contracts/claim-helper";
import { useTonClient } from "./use-tonclient";
import { useAsyncInitialize } from "./use-asyncInitialize";
import { useTonConnect } from "./use-tonconnect";
import { Address, Cell, OpenedContract } from "@ton/core";

export function useClaimHelperContract(contractAddress: string, proof: Cell) {
  const client = useTonClient();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const claimHelperContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new ClaimHelper(
      Address.parse(contractAddress)
    );
    return client.open(contract) as OpenedContract<ClaimHelper>;
  }, [client, contractAddress, proof]);

  return {
    sendClaim: () => {
      return claimHelperContract?.sendClaim(BigInt(0), proof);
    },
  };
}
