
export enum PaymentStatus {
    PENDING = 0,
    SUCCESS = 1,
    FAILED = 2,
  }
  export const getPaymentStatusKey = (value: number | undefined): keyof typeof PaymentStatus | undefined => {
    return Object.entries(PaymentStatus).find(([_, v]) => v === value)?.[0] as keyof typeof PaymentStatus | undefined;
  };