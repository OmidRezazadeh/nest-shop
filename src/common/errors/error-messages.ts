export const ErrorMessage = {
  USER: {
    NOT_FOUND: ' کاربری یافت نشد',
    ID_NOT_FOUND: 'شناسه کاربر یافت نشد',
  },
  AUTH: {
    UNAUTHORIZED: 'احراز هویت نامعتبر است',
    INVALID_CREDENTIALS: 'اطلاعات ورود نامعتبر است',
    REFRESH_TOKEN_INVALID: 'توکن Refresh نامعتبر است',
    REFRESH_TOKEN_EXPIRED: 'نشانه Refresh منقضی شده است. لطفا دوباره وارد شوید',
    USER_NOT_VERIFIED: ' کاربر  صحت سنجی نشده',
  },
  CONFIRMATION_CODE:{
    NOT_FOUND:'کدی یافت نشد',
    INVALID: 'کد وارد شده صحیح نیست ',
    EXPIRED: ' این کد منقضی شده ',
  },
  CART: {
    ALREADY_EXISTS: 'سبد خرید دیگری وجود دارد',
    NOT_FOUND: 'سبد خریدی یافت نشد',
    CREATE_FAILED: 'ثبت سبد خرید با خطا مواجه شد',
  },
  CART_ITEM: {
    QUANTITY_EXCEEDS_STOCK: 'تعداد محصول بیش از حد موجود است',
    NOT_FOUND: ' ایتم سبد خریدی یافت نشد',
  },
  PRODUCT: {
    NOT_FOUND: 'محصولی یافت نشد',
    NOT_FOUND_BY_ID: (id: number | string) => `محصول با شناسه ${id} یافت نشد`,
  },
  CHAT:{
    NOT_FOUND: 'پیامی یافت نشد',
    ACCESS_DENIED: 'شما اجازه دسترسی به این چت را ندارید',
    CONVERSATION_NOT_FOUND: 'گفتگویی یافت نشد',
  },
  ORDER: {
    NOT_FOUND: 'سفارشی یافت نشد',
    ALREADY_PAID: ' این سفارش قبلا پرداخت شده ',
    INVALID_STATUS: ' وضعیت وارد شده صحیح نیست',
    ACCESS_DENIED: 'شما نمیتوانید به این سفارش دسترسی داشته باشید ',
  },
  ORDER_ITEM: {
    NOT_FOUND: 'آیتمی یافت نشد',
    PRODUCT_OUT_OF_STOCK_BY_NAME: (name: string) => ` تعداد کالا ${name} موجود نیست `,
    QUANTITY_LESS_THAN_REQUESTED: ' تعداد محصول کمتر از تعداد درخواستی است ',
  },
  TRANSACTION: {
    NOT_FOUND: 'تراکنش یافت نشد',
  },
  TAG: {
    NOT_FOUND: 'تگ مورد نظر یافت نشد',
  },
  PROFILE: {
    NOT_FOUND: 'پروفایلی یافت نشد',
  },
  PHOTO: {
    NOT_FOUND: 'عکس مورد نظر یافت نشد',
  },
  WALLET: {
    INSUFFICIENT_BALANCE: '  مبلغ کیف پول کافی نیست ',
  },
  FILE: {
    REQUIRED: ' لطفا فایل را اپلود کنید',
    TOO_LARGE: (max: number) => ` اندازه فایل از حد مجاز بیشتر است ${max} `,
    INVALID_FORMAT: 'فرمت فایل اپلود شده صحیح نیست',
  },
  PERMISSION: {
    ACCESS_DENIED: 'شما اجازه دسترسی ندارید',
    OPERATION_FORBIDDEN: 'شما مجاز به انجام این عملیات نیستید',
  },
  PAYMENT: {
    CANCELED: 'پرداخت لغو شد',
    FAILED: 'پرداخت ناموفق',
    SUCCESS: ' پرداخت با موفقیت انجام شد',
    ERROR: ' پرداخت با مشکل مواجه شد',
  },
  GENERAL: {
    SERVER_ERROR: 'خطای سرور',
    RETRY: 'لطفا مجددا امتحان کنید',
    TRY_AGAIN: 'خطایی رخ داده است، لطفا مجددا تلاش کنید.',
  },


};