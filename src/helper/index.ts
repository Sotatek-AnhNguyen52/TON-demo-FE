import { TWA_HASH } from '../constant';
import { UserInfo } from '../types/common';

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
