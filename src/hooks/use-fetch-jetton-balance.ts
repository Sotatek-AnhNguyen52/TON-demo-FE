import { useEffect, useState } from "react";
import TonWeb from "tonweb";
import { contractAddress, tonWebApiKey } from "../configs";
import { useTonWallet } from "@tonconnect/ui-react";

export const testnet = "https://testnet.toncenter.com/api/v2/jsonRPC";
const useFetchJettonBalance = (): [string | null, boolean, () => void, string | null] => {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<string | null>(null);
  const wallet = useTonWallet();

  const shouldRefreshBalnce = () => {
    setRefresh((prev) => !prev);
  };

  const clearState = () => {
    setBalance(null);
    setLoading(false);
    setMetadata(null);
  }

  useEffect(() => {
    async function fetchJettonBalance() {
      if (!wallet) {
        clearState();
        return;
      }
      try {
        setLoading(true);
        const tonweb = new TonWeb(
          new TonWeb.HttpProvider(testnet, {
            apiKey: tonWebApiKey,
          })
        );
        const jettonMinter = new TonWeb.token.jetton.JettonMinter(
          tonweb.provider,
          {
            address: new TonWeb.utils.Address(contractAddress),
          } as any
        );

        const metadata = await jettonMinter.getJettonData();
        setMetadata(metadata.jettonContentUri);

        const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(
          new TonWeb.utils.Address(wallet.account.address)
        );
        const jettonWallet = new TonWeb.token.jetton.JettonWallet(
          tonweb.provider,
          {
            address: jettonWalletAddress,
          }
        );

        const jettonData = await jettonWallet.getData();
        if (
          jettonData.jettonMinterAddress.toString(false) !==
          new TonWeb.utils.Address(contractAddress).toString(false)
        ) {
          clearState();
          throw new Error(
            "jetton minter address from jetton wallet doesnt match config"
          );
        }
        setBalance(jettonData.balance.toString());
        setLoading(false);
      } catch (error) {
        clearState();
        console.log("Error fetching jetton balance", error);
      }
    }
    fetchJettonBalance();
  }, [refresh, wallet]);

  return [balance, loading, shouldRefreshBalnce, metadata];
};

export default useFetchJettonBalance;
