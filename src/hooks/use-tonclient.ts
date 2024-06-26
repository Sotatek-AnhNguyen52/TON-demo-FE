import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';
import { useAsyncInitialize } from './use-asyncInitialize';

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: await getHttpEndpoint({ network: 'testnet' }),
      })
  );
}