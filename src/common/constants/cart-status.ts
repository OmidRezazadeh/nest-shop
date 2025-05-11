export const CART_STATUS = {
    default:0,
    success: 1,
    failed: 2,
} as const;
export const getCartStatusKey = (value: number | undefined): keyof typeof CART_STATUS | undefined => {
    return Object.entries(CART_STATUS).find(([_, v]) => v === value)?.[0] as keyof typeof CART_STATUS | undefined;
  };