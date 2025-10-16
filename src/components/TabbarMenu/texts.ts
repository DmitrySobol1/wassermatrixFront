import type { SupportedLanguage, TabbarTexts } from '@/types/i18n.types';

export const TEXTS: Record<SupportedLanguage, TabbarTexts> = {
  ru: {
    firstTab: 'Каталог',
    secondTab: 'Корзина',
    thirdTab: 'Кабинет',
  },
  en: {
    firstTab: 'Catalog',
    secondTab: 'Cart',
    thirdTab: 'Account',
  },
  de: {
    firstTab: 'Katalog',
    secondTab: 'Wagen',
    thirdTab: 'Konto',
  },
};
