// Application route constants
// Using these constants helps avoid typos and makes refactoring easier

export const ROUTES = {
  // Main pages
  ENTER: '/',
  ONBOARDING: '/onboarding',
  CATALOG: '/catalog-page',
  CART: '/cart-page',

  // Account pages
  MY_ACCOUNT: '/myaccount-page',
  MY_ORDERS: '/myorders-page',
  MY_PROMOCODES: '/mypromocodes-page',
  MY_CASHBACK: '/mycashback-page',
  REFERAL_SYSTEM: '/referalsystem-page',
  SETTINGS: '/setting-button-menu',

  // Product pages
  ONE_GOOD: '/onegood-page',

  // Checkout flow
  DELIVERY_CHOICE: '/delivery-choice-page',
  PAYMENT_CHOICE: '/payment-choice-page',
  SUCCESS: '/success-page',
  CANCEL_PAY: '/cancellpay-page',

  // Crypto features
  EXCHANGE_STEP1: '/exchange-page-step1',
  EXCHANGE_STEP2: '/exchange-page-step2',
  PAYIN_STEP1: '/payin-page-step1',
  PAYIN_STEP2: '/payin-page-step2',
  PAYOUT_STEP1: '/payout-page-step1',
  PAYOUT_STEP2: '/payout-page-step2',
  TRANSFER_STEP1: '/transfer-page-step1',
  TRANSFER_STEP2: '/transfer-page-step2',

  // Telegram integration
  TON_CONNECT: '/ton-connect',
  INIT_DATA: '/init-data',
  THEME_PARAMS: '/theme-params',
  LAUNCH_PARAMS: '/launch-params',
} as const;
