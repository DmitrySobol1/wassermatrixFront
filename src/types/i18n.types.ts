// Supported languages in the application
export type SupportedLanguage = 'ru' | 'en' | 'de';

// Texts for Account page (MyAccount.tsx)
export type AccountTexts = {
  headerT: string;
  myOrdersT: string;
  settingsT: string;
  myPromocodesT: string;
  myCashbackT: string;
  referalSystemT: string;
};

// Texts for Tabbar menu
export type TabbarTexts = {
  firstTab: string;
  secondTab: string;
  thirdTab: string;
};

// Data types for Cashback functionality
export interface CashbackLevel {
  _id: string;
  position: number;
  percent: number;
  sum: number;
}

export interface CashbackData {
  purchaseQty: number;
  purchaseSum: number;
  clientCashbackLevel: string;
  deltaToNextLevel: number;
  cashbackLevels: CashbackLevel[];
  currentPercent: string;
  userValute: string;
  cashbackBall: number;
}
