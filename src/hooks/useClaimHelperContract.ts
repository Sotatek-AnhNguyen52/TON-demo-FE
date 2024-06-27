import { useEffect, useState } from 'react';
import { ClaimHelper } from '../contracts/claimHelper';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { Address, Cell, OpenedContract } from '@ton/core';

export function useClaimHelperContract(address: string | null) {
    const client = useTonClient();

    const counterContract = useAsyncInitialize(async () => {
        console.log('Opening contract', address);

        if (!client || !address) return;
        const contract = new ClaimHelper(
            Address.parse(address)
        );

        return client.open(contract) as OpenedContract<ClaimHelper>;
    }, [client, address]);

    const getClaimed = async () => {
        if (!counterContract) return;
        return await counterContract.getClaimed();
    }

    const sendClaim = async (proof: Cell) => {
        if (!counterContract) return;
        await counterContract.sendClaim(BigInt(24), proof)
    }

    return {
        getClaimed,
        sendClaim,
    };
}