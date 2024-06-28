import axios from 'axios';
import { UserInfo } from '../types/common';
import { JWT } from '../constant';
import { apiUrl } from '../configs';
import { axiosInstance } from './axios';

axiosInstance.interceptors.request.use((config) => {
    const authToken = localStorage.getItem(JWT);
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

const axiosInstanceNotAuth = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json'
    },
});

interface UpScorePayload {
    points: number;
    remaining_energy: number;
}

interface RequestClaimPayload {
    to: string;
    amount: string;
}

interface RequestedClaimPayload {
    id: string;
    amount: string;
    merkleProof: string;
    treeIndex: string;
    claimMaster: string;
    isClaimed: boolean;
}

interface GetScoreResponse {
    isSucceed: boolean;
    message: string;
    value: {
        points: string;
        restore_time: string;
        energy: number;
    };
}

export interface LoginResponse {
    statusCode: number;
    status: string;
    sync_data: {
        referral_code: string;
        miner_level: number;
        tap_points: string;
        auth_token: string;
    };
    message: string;
}

export const requestClaim = async (data: RequestClaimPayload) => {
    try {
        const response = await axiosInstance.post('/tg/request-claim', data);
        return response.data.data;
    } catch (error) {
        console.error('Error request claim:', error);
        return null;
    }
};

export const getRequestedClaim = async () : Promise<RequestedClaimPayload[] | null> => {
    try {
        const response = await axiosInstance.get('/tg/request-claim');
        return response.data.data;
    } catch (error) {
        console.error('Error getting requested claim:', error);
        return null;
    }
}

export const upScore = async (data: UpScorePayload) => {
    try {
        const response = await axiosInstance.post('/game/upscore', data);
        return response.data;
    } catch (error) {
        console.error('Error updating score:', error);
        return null;
    }
};

export const getScore = async (): Promise<GetScoreResponse | null> => {
    try {
        const response = await axiosInstance.get('/game/getscore');
        return response.data;
    } catch (error) {
        console.error('Error getting score:', error);
        return null;
    }
};

export const loginUser = async (userInfo: UserInfo): Promise<LoginResponse | null> => {
    try {
        const response = await axiosInstanceNotAuth.post('/tg/auth', userInfo);
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        return null;
    }
};

export const updateIsClaimed = async (id: string) => {
    try {
        await axiosInstance.post(`/tg/claim/${id}`);
        return true;
    } catch (error) {
        console.error('Error updating claimed:', error);
        return null;
    }
}