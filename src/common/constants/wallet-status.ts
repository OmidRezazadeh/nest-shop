export enum WalletStatus {
    PENDING = 0,
    SUCCESS = 1,
    FAILED = 2,
  }
  export const getWalletStatusKey = (value: number | undefined): keyof typeof WalletStatus | undefined => {
    return Object.entries(WalletStatus).find(([_, v]) => v === value)?.[0] as keyof typeof WalletStatus | undefined;
  };