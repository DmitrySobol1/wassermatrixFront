import type { ComponentType, JSX } from 'react';


import { EnterPage } from '@/pages/EnterPage/EnterPage';
import { CatalogPage } from '@/pages/Catalog/Catalog';
import { SalePage } from '@/pages/Catalog/SalePage';
import { OneGood } from '@/pages/Catalog/OneGood';
import { Cart } from '@/pages/Cart/Cart';
import { DeliveryChoice } from '@/pages/Cart/DeliveryChoice';
import { PaymentChoice } from '@/pages/Cart/PaymentChoice';
import { SuccessPage } from '@/pages/Cart/SuccessPage';
import { CancellPay } from '@/pages/Cart/CancellPay';

import { MyAccount } from '@/pages/Account/MyAccount'
import { Orders } from '@/pages/Account/Orders';
import { MyPromocodes } from '@/pages/Account/MyPromocodes';
import { MyCashbacksBalls } from '@/pages/Account/MyCashbacksBalls';
import { ReferalSystem } from '@/pages/Account/ReferalSystem';
// import { ShowReceipt } from '@/pages/Account/ShowReceipt';



import { InitDataPage } from '@/pages/InitDataPage.tsx';
import { LaunchParamsPage } from '@/pages/LaunchParamsPage.tsx';
import { ThemeParamsPage } from '@/pages/ThemeParamsPage.tsx';
import { Onboarding } from '@/pages/Onboarding/Onboarding';
import { SettingsButtonMenu } from '@/pages/SettingsButtonMenu/SettingsButtonMenu';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: EnterPage },
  { path: '/onboarding', Component: Onboarding, title: 'Onboarding' },
  
  
  //SHOP PAGES
  { path: '/catalog-page', Component: CatalogPage},
  { path: '/onegood-page', Component: OneGood},
  { path: '/sale-page', Component: SalePage},
  
  { path: '/cart-page', Component: Cart},
  { path: '/delivery-choice-page', Component: DeliveryChoice},
  { path: '/payment-choice-page', Component: PaymentChoice},
  { path: '/success-page', Component: SuccessPage},
  { path: '/cancellpay-page', Component: CancellPay},
  


  { path: '/myaccount-page', Component: MyAccount},
  { path: '/myorders-page', Component: Orders},
  { path: '/mypromocodes-page', Component: MyPromocodes},
  { path: '/mycashback-page', Component: MyCashbacksBalls},
  { path: '/referalsystem-page', Component: ReferalSystem},
  // { path: '/showreceipt-page', Component: ShowReceipt},
  
  
  { path: '/setting-button-menu', Component: SettingsButtonMenu, title: 'Settings Button Menu' },

  
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
  
  
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },

];
