export type UserInfo = {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    language_code: string;
    is_premium: boolean;
}

export type DeployInfo = {
    claimMaster: string;
    merkeleProof: string;
    treeIndex: string;
    amount: string;
}