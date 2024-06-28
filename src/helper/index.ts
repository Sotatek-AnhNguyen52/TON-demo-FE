import TonWeb from 'tonweb';
import { TWA_HASH } from '../constant';
import { UserInfo } from '../types/common';
import { testnet } from '../hooks/use-fetch-jetton-balance';
import { tonWebApiKey } from '../configs';

export const parseTGHashData = (hashString: string): UserInfo | null => {
    const params = new URLSearchParams(hashString);
    const tgWebAppData = params.get(TWA_HASH);
    if (tgWebAppData) {
        try {
            const decodedData = decodeURIComponent(tgWebAppData);
            const userParam = new URLSearchParams(decodedData).get('user');
            if (userParam) {
                const userData = JSON.parse(decodeURIComponent(userParam));
                return {
                    id: userData.id,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    username: userData.username,
                    language_code: userData.language_code,
                    is_premium: userData.allows_write_to_pm,
                };
            }
        } catch (error) {
            console.error('Error parsing tgWebAppData:', error);
            return null;
        }
    }
    return null;
};

export const getTonweb = () => {
    return new TonWeb(
        new TonWeb.HttpProvider(testnet, {
            apiKey: tonWebApiKey,
        })
    );

}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const refreshTokenBalance = async (address: string, lastTxHash: any, refresh: () => void) => {
    const tonweb = getTonweb();
    let txHash = lastTxHash;
    console.log("🚀 ~ refreshTokenBalance ~ lastTxHash:", lastTxHash)
    const startTime = Date.now();
    while (txHash == lastTxHash && (Date.now() - startTime) < 30000) {
        await delay(1500);
        let tx = (await tonweb.getTransactions(address, 1))[0];
        txHash = tx.transaction_id.hash;
        console.log("🚀 ~ refreshTokenBalance ~ txHash:", txHash)
    }
    refresh();
    console.log('Done!');
}