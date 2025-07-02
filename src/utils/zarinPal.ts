const ZarinpalCheckout = require('zarinpal-checkout');
export const zarinpal = ZarinpalCheckout.create(
  '6cded376-3063-11e9-a98e-005056a205be',
  true,
);

export async function pay(paymentData: any) {
  try {
    const response = await zarinpal.PaymentRequest({
      Amount: paymentData.amount,
      CallbackURL: 'http://localhost:3000/paycallback',
      Description: 'پرداخت ',
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}
export async function verify(authority:string, amount:number) {
  try {
    const result= await zarinpal.PaymentVerification({
      Amount:Math.floor(amount),
      Authority:authority
    });
    console.log(result);
    return result;
  } catch (error) {
        console.log(error)
  }
}
