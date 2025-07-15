export enum WalletType {
    DEPOSIT = 0,
    WITHDRAW = 1,
    WITHDRAWAL_TARGET_WALLET=2
  }
  export const getWalletTypeKey = (value: number | undefined): keyof typeof WalletType | undefined => {
    return Object.entries(WalletType).find(([_, v]) => v === value)?.[0] as keyof typeof WalletType | undefined;
  };