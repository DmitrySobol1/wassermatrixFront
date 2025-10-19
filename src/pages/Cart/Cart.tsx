import {
  Section,
  Cell,
  List,
  ButtonCell,
  Image,
  Text,
  Snackbar,
  Spinner,
  Button
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import axios from '../../axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, useCallback, memo, useMemo } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import { useSettingsButton } from '@/hooks/useSettingsButton';

// ============================================================================
// Типы
// ============================================================================

interface CartItem {
  itemId: string;
  qty: number;
  img: string;
  totalpriceItem: number;
  priceToShow: number;
  valuteToShow: string;
  name_ru: string;
  name_en: string;
  name_de: string;
}

interface TotalInfo {
  totalQty: number;
  totalPriceCart: number;
  valuteToShow: string;
  goods: CartItem[];
}

interface CartState {
  cart: CartItem[];
  totalInfo: Partial<TotalInfo>;
  valuteToShowOnFront: string;
  isLoading: boolean;
  noCart: boolean;
}

interface LoadingItem {
  id: string;
  action: 'plus' | 'minus' | 'delete';
}

// ============================================================================
// Константы
// ============================================================================

const DOMEN = import.meta.env.VITE_DOMEN;

const SPINNER_CONTAINER_STYLE: React.CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
  padding: '100px',
};

const BOTTOM_SECTION_STYLE: React.CSSProperties = {
  marginBottom: 100,
  padding: 10,
};

const CELL_STYLE: React.CSSProperties = {
  paddingTop: 15,
};

const ERROR_MESSAGE_STYLE: React.CSSProperties = {
  color: 'red',
  marginBottom: '10px',
};

// ============================================================================
// Вспомогательные компоненты
// ============================================================================

interface CartItemProps {
  item: CartItem;
  language: string;
  loadingItem: LoadingItem | null;
  onCartAction: (goodId: string, action: 'plus' | 'minus' | 'delete') => void;
  texts: {
    addedT: string;
    pcsT: string;
    plusT: string;
    minusT: string;
    deleteT: string;
  };
}

/**
 * Мемоизированный компонент товара в корзине
 * Предотвращает ре-рендеры неизмененных товаров
 */
const CartItem = memo<CartItemProps>(({ item, language, loadingItem, onCartAction, texts }) => {
  const isItemLoading = loadingItem?.id === item.itemId;
  const itemName = item[`name_${language}` as keyof CartItem] as string;
  const { addedT, pcsT, plusT, minusT, deleteT } = texts;

  return (
    <Section>
      <Cell
        subtitle={`${addedT} ${item.qty} ${pcsT}`}
        before={<Image size={96} src={`${DOMEN}${item.img}`} />}
        style={CELL_STYLE}
        after={`${item.totalpriceItem}${item.valuteToShow}`}
        description={`1 ${pcsT} x ${item.priceToShow} ${item.valuteToShow}`}
        multiline
      >
        {itemName}
      </Cell>

      <ButtonCell
        before={<Image size={24}><AddCircleOutlineIcon /></Image>}
        onClick={() => onCartAction(item.itemId, 'plus')}
        disabled={loadingItem !== null}
      >
        {isItemLoading && loadingItem.action === 'plus' ? (
          <Spinner size="s" />
        ) : (
          <Text weight="2">{plusT}</Text>
        )}
      </ButtonCell>

      <ButtonCell
        before={<Image size={24}><RemoveCircleOutlineIcon /></Image>}
        onClick={() => onCartAction(item.itemId, 'minus')}
        disabled={loadingItem !== null}
      >
        {isItemLoading && loadingItem.action === 'minus' ? (
          <Spinner size="s" />
        ) : (
          <Text weight="2">{minusT}</Text>
        )}
      </ButtonCell>

      <ButtonCell
        before={<Image size={24}><DeleteOutlineIcon /></Image>}
        onClick={() => onCartAction(item.itemId, 'delete')}
        disabled={loadingItem !== null}
      >
        {isItemLoading && loadingItem.action === 'delete' ? (
          <Spinner size="s" />
        ) : (
          <Text weight="2">{deleteT}</Text>
        )}
      </ButtonCell>
    </Section>
  );
});

CartItem.displayName = 'CartItem';

// ============================================================================
// Основной компонент
// ============================================================================

export const Cart: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [wentWrong, setWetWrong] = useState(false)

  // Состояния корзины
  const [cartState, setCartState] = useState<CartState>({
    cart: [],
    totalInfo: {},
    valuteToShowOnFront: '',
    isLoading: true,
    noCart: false,
  });

  // UI состояния
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [loadingItem, setLoadingItem] = useState<LoadingItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Деструктуризация текстов
  const texts = TEXTS[language];
  const { plusT, minusT, deleteT, totalT, pcsT, addedT, nextBtn, itemAdded, emptyCartT, toCatalogT, errorT, btnErrorT } = texts;

  // Мемоизированный объект текстов для CartItem
  const cartItemTexts = useMemo(() => ({
    addedT,
    pcsT,
    plusT,
    minusT,
    deleteT,
  }), [addedT, pcsT, plusT, minusT, deleteT]);

  // Мемоизированные обработчики навигации
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  const handleNavigateToCatalog = useCallback(() => {
    navigate('/catalog-page');
  }, [navigate]);

  const handleNavigateToDelivery = useCallback(() => {
    navigate('/delivery-choice-page', {
      state: { cart: cartState.cart },
    });
  }, [navigate, cartState.cart]);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // Загрузка корзины
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get('/user_get_mycart', {
          params: { tlgid },
        });
        console.log('cart', response);

        setCartState({
          cart: response.data.goods,
          totalInfo: response.data,
          valuteToShowOnFront: response.data.valuteToShow,
          isLoading: false,
          noCart: response.data.goods.length === 0,
        });
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
        setError(errorT);
        setWetWrong(true)
        setCartState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchCart();
  }, [tlgid, errorT]);

  // Мемоизированный обработчик действий с корзиной
  const cartButtonsHandler = useCallback(async (goodId: string, action: 'plus' | 'minus' | 'delete') => {
    // Блокируем повторные клики
    if (loadingItem) return;

    setLoadingItem({ id: goodId, action });
    setError(null);

    try {
      await axios.post('/user_add_good_tocart', {
        userid: tlgid,
        action: action,
        goodsarray: [{ itemId: goodId, qty: 1 }],
      });

      // Получаем обновленную корзину
      const response = await axios.get('/user_get_mycart', {
        params: { tlgid },
      });
      console.log('cart updated', response);

      setCartState({
        cart: response.data.goods,
        totalInfo: response.data,
        valuteToShowOnFront: response.data.valuteToShow,
        isLoading: false,
        noCart: response.data.goods.length === 0,
      });
    } catch (error) {
      console.error('Ошибка при обновлении корзины:', error);
      setError(errorT);
    } finally {
      setLoadingItem(null);
    }
  }, [tlgid, loadingItem, errorT]);

  // Early return для loading состояния
  if (cartState.isLoading) {
    return (
      <Page back={false}>
        <div style={SPINNER_CONTAINER_STYLE}>
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

  // Early return для пустой корзины
  if (cartState.noCart) {
    return (
      <Page back={false}>
        <Section>
          <Cell>{emptyCartT}</Cell>
          <Section style={BOTTOM_SECTION_STYLE} onClick={handleNavigateToCatalog}>
            <Button stretched>{toCatalogT}</Button>
          </Section>
        </Section>
        <TabbarMenu />
      </Page>
    );
  }

   // Early return для ошибки
  if (wentWrong) {
    return (
      <Page back={false}>
        <Section>
                                  <Cell>
                                    <div style={ERROR_MESSAGE_STYLE}>
                                       {errorT}
                                    </div>
                                    <Button onClick={() => window.location.reload()} size="m">
                                      {btnErrorT}
                                    </Button>
                                  </Cell>
                                </Section>
        <TabbarMenu />
      </Page>
    );
  }

  // Основной контент корзины
  return (
    <Page back={false}>
      <List>
        {cartState.cart.map((item) => (
          <CartItem
            key={item.itemId}
            item={item}
            language={language}
            loadingItem={loadingItem}
            onCartAction={cartButtonsHandler}
            texts={cartItemTexts}
          />
        ))}

        <Section>
          <Cell
            subtitle={`${cartState.totalInfo.totalQty} ${pcsT}`}
            style={CELL_STYLE}
            after={<Text weight='2'>{`${cartState.totalInfo.totalPriceCart} ${cartState.valuteToShowOnFront}`}</Text>}
          >
            <Text weight='2'>{totalT}</Text>
          </Cell>
        </Section>

        <Section style={BOTTOM_SECTION_STYLE} onClick={handleNavigateToDelivery}>
          <Button stretched>{nextBtn}</Button>
        </Section>
      </List>

      {openSnakbar && (
        <Snackbar duration={1500} onClose={() => setOpenSnakbar(false)}>
          {itemAdded}
        </Snackbar>
      )}

      {error && (
        <Snackbar duration={3000} onClose={() => setError(null)}>
          {error}
        </Snackbar>
      )}

      <TabbarMenu />
    </Page>
  );
};
