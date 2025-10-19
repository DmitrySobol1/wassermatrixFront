import { Cell, Text } from '@telegram-apps/telegram-ui';
import { memo } from 'react';
import type { CartItem as CartItemType } from './PaymentChoice.types';

interface CartItemProps {
  item: CartItemType;
  language: string;
  deliveryRegion: string;
  qtyT: string;
  pcsT: string;
  priceGoodT: string;
  priceDeliveryT: string;
}

const CART_ITEM_STYLES = {
  strikethrough: {
    textDecoration: 'line-through' as const,
  },
  saleBadge: {
    color: 'white',
    backgroundColor: '#ed6c02',
    padding: 10,
    marginLeft: 20,
  },
} as const;

export const CartItem = memo(({
  item,
  language,
  deliveryRegion,
  qtyT,
  pcsT,
  priceGoodT,
  priceDeliveryT
}: CartItemProps) => {
  const itemPrice = Number(item.priceToShow) || 0;
  const priceWithoutPromo = Number(item.priceToShowNoPromoApplied) || 0;
  const deliveryPrice = Number(item[`deliveryPriceToShow_${deliveryRegion}`]) || 0;
  const quantity = Number(item.qty) || 0;
  const totalItemCost = ((itemPrice + deliveryPrice) * quantity).toFixed(2);

  const renderPrice = () => {
    const totalPrice = (itemPrice * quantity).toFixed(2);
    const oldTotalPrice = (priceWithoutPromo * quantity).toFixed(2);

    // Если применена скидка по промокоду
    if (item.isWithPromoSale) {
      return (
        <div>
          {priceGoodT}{' '}
          <span style={CART_ITEM_STYLES.strikethrough}>{oldTotalPrice}</span>{' '}
          {totalPrice} {item.valuteToShow}
        </div>
      );
    }

    // Если применена скидка по кешбэку
    if (item.isWithCashbackSale) {
      return (
        <div>
          {priceGoodT}{' '}
          <span style={CART_ITEM_STYLES.strikethrough}>{oldTotalPrice}</span>{' '}
          {totalPrice} {item.valuteToShow}
        </div>
      );
    }

    // Обычная цена без скидок
    return (
      <div>
        {priceGoodT} {totalPrice} {item.valuteToShow}
      </div>
    );
  };

  return (
    <Cell
      key={item.itemId}
      multiline
      description={
        <>
          <div>
            {qtyT} {quantity} {pcsT}
          </div>
          {renderPrice()}
          <div>
            {priceDeliveryT} {(deliveryPrice * quantity).toFixed(2)} {item.valuteToShow}
          </div>
        </>
      }
      after={
        <Text weight="3">
          {totalItemCost} {item.valuteToShow}
        </Text>
      }
    >
      {item[`name_${language}`] || item.name_en}
      {item.isSaleNow && (
        <span style={CART_ITEM_STYLES.saleBadge}>
          sale
        </span>
      )}
    </Cell>
  );
});

CartItem.displayName = 'CartItem';
