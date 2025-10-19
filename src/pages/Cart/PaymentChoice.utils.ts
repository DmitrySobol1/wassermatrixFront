import { CartItem } from './PaymentChoice.types';

/**
 * Вычисляет общую сумму заказа на основе корзины товаров
 */
export function calculateTotalOrderSum(cart: CartItem[], deliveryRegion: string): number {
  if (!cart || cart.length === 0) return 0;

  return cart.reduce((sum, item) => {
    const itemPrice = Number(item.priceToShow) || 0;
    const deliveryPrice = Number(item[`deliveryPriceToShow_${deliveryRegion}`]) || 0;
    const quantity = Number(item.qty) || 0;

    return sum + (itemPrice + deliveryPrice) * quantity;
  }, 0);
}

/**
 * Вычисляет сумму кешбэка для начисления
 */
export function calculateCashbackAmount(totalSum: number, percent: number): number {
  return Number((totalSum * (percent / 100)).toFixed(4));
}

/**
 * Проверяет, все ли товары в корзине находятся на распродаже
 */
export function areAllItemsOnSale(cart: CartItem[]): boolean {
  return cart.every((item) => item.isSaleNow);
}
