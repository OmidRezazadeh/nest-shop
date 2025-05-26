export const ORDER_STATUS={
     pending:0, 
     paid:1,
     shipped:2, 
     cancelled:3
}
export const getOrderStatusKey = (value: number | undefined): keyof typeof ORDER_STATUS | undefined => {
    return Object.entries(ORDER_STATUS).find(([_, v]) => v === value)?.[0] as keyof typeof ORDER_STATUS | undefined;
  };