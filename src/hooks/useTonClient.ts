// import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from "@ton/ton";
import { useAsyncInitialize } from './useAsyncInitialize';
import { tonWebApiKey } from '../configs';
import { testnet } from './use-fetch-jetton-balance';

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: testnet,
        apiKey: tonWebApiKey,
      })
  );
}