import {
  Section,
  Spinner,
  Button,
  List,
  Cell,
  Text,
  Snackbar,
  Input,
  Tappable,
  Chip,
  TabsList,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useContext, useCallback, useReducer, useMemo, useState } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import axios from '../../axios';
import { TabsItem } from '@telegram-apps/telegram-ui/dist/components/Navigation/TabsList/components/TabsItem/TabsItem';
import { useSettingsButton } from '@/hooks/useSettingsButton';
import { CartItem } from './CartItem.tsx';
import { STYLES } from './PaymentChoice.styles.ts';
import { paymentReducer, initialState } from './PaymentChoice.types.ts';
import { calculateTotalOrderSum, calculateCashbackAmount, areAllItemsOnSale } from './PaymentChoice.utils.ts';
import type { CartItem as CartItemType } from './PaymentChoice.types.ts';

export const PaymentChoice: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [wentWrong, setWentWrong] = useState(false)

  const { cart: initialCart, deliveryInfo, deliveryRegion } = location.state || {};

  // Используем useReducer для управления состоянием
  const [state, dispatch] = useReducer(paymentReducer, {
    ...initialState,
    cart: {
      ...initialState.cart,
      cart: initialCart || [],
      rebootedCartPrice: initialCart || [],
    },
  });

  // Мемоизируем тексты для текущего языка
  const texts = useMemo(() => TEXTS[language], [language]);

  // Деструктурируем тексты
  const {
    priceDeliveryT,
    header2T,
    qtyT,
    priceGoodT,
    pcsT,
    itogoT,
    payBtn2T,
    enterPromocodeT,
    promocodePlaceholderT,
    applyT,
    useCashbackT,
    writeoffT,
    zeroCashbackT,
    zeroCashbackInfoT,
    willAddWhenPurchaseT,
    toAddCashbackT,
    promocodeT,
    writeOffT,
    LoyaltySystemT,
    setPromocodeT,
    errorT,
    btnErrorT
  } = texts;

  // Мемоизируем проверку, все ли товары на распродаже
  const allItemsOnSale = useMemo(
    () => areAllItemsOnSale(state.cart.cart),
    [state.cart.cart]
  );

  // Валидация данных из роутера при монтировании
  useEffect(() => {
    if (!initialCart || !deliveryInfo || !deliveryRegion) {
      console.error('Missing required data from location.state');
      navigate('/cart-page');
    }
  }, [initialCart, deliveryInfo, deliveryRegion, navigate]);

  // Загрузка данных о кешбэке
  useEffect(() => {
    let isMounted = true;

    const fetchCashbackData = async () => {
      dispatch({ type: 'SET_LOADING_SUM', payload: true });

      try {
        const ordersResponse = await axios.get('/user_get_orders', {
          params: { tlgid, payStatus: true },
        });

        if (!isMounted) return;

        const responseData = ordersResponse.data;

        dispatch({
          type: 'SET_CASHBACK_DATA',
          payload: {
            value: responseData.cashbackBall.toString(),
            enteredValue: `${responseData.cashbackBall} ${responseData.valute}`,
            currentPercent: responseData.currentPercent,
            userValute: responseData.valute,
            isRunoutShow: responseData.cashbackBall === 0,
          },
        });

        if (state.cart.cart && state.cart.cart.length > 0) {
          const valuteToShow = state.cart.cart[0].valuteToShow;
          dispatch({ type: 'SET_VALUTE_TO_SHOW', payload: valuteToShow });

          const total = calculateTotalOrderSum(state.cart.cart, deliveryRegion);
          dispatch({ type: 'SET_TOTAL_ORDER_SUM', payload: total });

          // Сохраняем начальную цену корзины
          dispatch({
            type: 'SET_CASHBACK_DATA',
            payload: {
              willBeCashbacked: calculateCashbackAmount(total, responseData.currentPercent),
            },
          });

          // Устанавливаем начальную общую сумму
          state.cart.rebootedTotalCartPrice = total;
        }
      } catch (error) {
        console.error('Error fetching cashback data:', error);
        setWentWrong(true)
        if (isMounted) {
          dispatch({
            type: 'SET_SNACKBAR',
            payload: { open: true, message: 'Ошибка загрузки данных кешбэка' },
          });
        }
      } finally {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING_SUM', payload: false });
        }
      }
    };

    if (tlgid && state.cart.cart.length > 0) {
      fetchCashbackData();
    }

    // Cleanup function для предотвращения утечек памяти
    return () => {
      isMounted = false;
    };
  }, [tlgid, deliveryRegion]);

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // Обработчик применения промокода
  const handleApplyPromocode = useCallback(async () => {
    if (!state.promocode.value.trim()) {
      dispatch({
        type: 'SET_PROMOCODE_INFO',
        payload: { text: setPromocodeT, type: 'error', show: true },
      });
      return;
    }

    dispatch({ type: 'SET_PROMOCODE_LOADING', payload: true });

    try {
      const response = await axios.post('/check_promocode', {
        code: state.promocode.value.trim(),
        userId: tlgid,
      });

      if (response.data.status === 'ok') {
        const total = calculateTotalOrderSum(response.data.goods, deliveryRegion);

        dispatch({
          type: 'APPLY_DISCOUNT',
          payload: {
            goods: response.data.goods,
            total,
            textForUser: response.data.textForUser,
            loyaltyType: 'usedPromocode',
          },
        });
      }
    } catch (error: any) {
      console.error('Ошибка при проверке промокода:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при проверке промокода';

      dispatch({
        type: 'SET_PROMOCODE_INFO',
        payload: { text: errorMessage, type: 'error', show: true },
      });
      dispatch({ type: 'SET_PROMOCODE_VALUE', payload: '' });
    } finally {
      dispatch({ type: 'SET_PROMOCODE_LOADING', payload: false });
    }
  }, [state.promocode.value, tlgid, deliveryRegion, setPromocodeT]);

  // Обработчик списания кешбэка
  const handleWriteOffCashback = useCallback(async () => {
    dispatch({ type: 'SET_PROMOCODE_LOADING', payload: true });

    try {
      const response = await axios.post('/writeoff_cashback', {
        cashbackValue: state.cashback.value,
        userId: tlgid,
      });

      if (response.data.status === 'ok') {
        const total = calculateTotalOrderSum(response.data.goods, deliveryRegion);

        dispatch({
          type: 'APPLY_DISCOUNT',
          payload: {
            goods: response.data.goods,
            total,
            textForUser: response.data.textForUser,
            loyaltyType: 'writeOffCashback',
          },
        });
      }
    } catch (error: any) {
      console.error('Ошибка при списании кешбэка:', error);
    } finally {
      dispatch({ type: 'SET_PROMOCODE_LOADING', payload: false });
    }
  }, [state.cashback.value, tlgid, deliveryRegion]);

  // Обработчик оплаты
  const handlePayment = useCallback(async () => {
    if (!state.cart.cart || !deliveryInfo) {
      dispatch({
        type: 'SET_SNACKBAR',
        payload: { open: true, message: 'Ошибка: отсутствуют данные заказа' },
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const paymentData = {
        cart: state.cart.cart,
        deliveryInfo: deliveryInfo,
        totalSum: state.cart.totalOrderSum,
        region: deliveryRegion,
        tlgid: tlgid,
        typeLoyaltySystem: state.settings.typeLoyaltySystem,
        shouldBeCashbacked: state.cashback.willBeCashbacked,
        cashbackValute: state.cashback.userValute,
      };

      const response = await axios.post('/create_payment_session', paymentData);

      if (response.data.status === 'ok') {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.data.message || 'Ошибка при создании сессии оплаты');
      }
    } catch (error) {
      console.error('Ошибка при создании сессии оплаты:', error);
      dispatch({
        type: 'SET_SNACKBAR',
        payload: { open: true, message: 'Ошибка при переходе к оплате. Попробуйте еще раз.' },
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    state.cart.cart,
    state.cart.totalOrderSum,
    state.settings.typeLoyaltySystem,
    state.cashback.willBeCashbacked,
    state.cashback.userValute,
    deliveryInfo,
    deliveryRegion,
    tlgid,
  ]);

  // Обработчики переключения табов
  const handleTabChange = useCallback(
    (tabNumber: number) => {
      dispatch({ type: 'SET_SELECTED_TAB', payload: tabNumber });
      dispatch({ type: 'RESET_TO_ORIGINAL_CART' });

      if (tabNumber === 1) {
        dispatch({ type: 'SET_LOYALTY_TYPE', payload: 'addCashback' });
      }
    },
    []
  );

  // Обработчик изменения промокода
  const handlePromocodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_PROMOCODE_VALUE', payload: e.target.value });
    dispatch({
      type: 'SET_PROMOCODE_INFO',
      payload: { text: '', type: 'error', show: false },
    });
  }, []);

  // Обработчик закрытия snackbar
  const handleCloseSnackbar = useCallback(() => {
    dispatch({ type: 'SET_SNACKBAR', payload: { open: false, message: '' } });
  }, []);

  // Early return для пустой корзины
  if (!state.cart.cart || state.cart.cart.length === 0) {
    return (
      <Page back={true}>
        <Section>
          <Cell>Корзина пуста</Cell>
        </Section>
        <TabbarMenu />
      </Page>
    );
  }

  // Early return для loading
  if (state.ui.isLoading) {
    return (
      <Page back={true}>
        <div style={STYLES.loadingContainer}>
          <Spinner size="m" />
        </div>
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
                                    <div style={STYLES.errorMessageStyle}>
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



  return (
    <Page back={true}>
      <List>
        {/* Список товаров */}
        <Section header={header2T}>
          {state.cart.cart.map((item: CartItemType) => (
            <CartItem
              key={item.itemId}
              item={item}
              language={language}
              deliveryRegion={deliveryRegion}
              qtyT={qtyT}
              pcsT={pcsT}
              priceGoodT={priceGoodT}
              priceDeliveryT={priceDeliveryT}
            />
          ))}
        </Section>

        {/* Итоговая сумма */}
        <Section>
          <Cell
            multiline
            after={
              <Text weight="2">
                {state.ui.isLoadingSum ? (
                  <Spinner size="s" />
                ) : !state.cart.isShowOldTotalOrderSum ? (
                  `${state.cart.totalOrderSum.toFixed(2)} ${state.cart.valuteToShowOnFront}`
                ) : (
                  <>
                    <span style={STYLES.strikethrough}>
                      {state.cart.oldTotalOrderSum.toFixed(2)}
                    </span>
                    {` ${state.cart.totalOrderSum.toFixed(2)} ${state.cart.valuteToShowOnFront}`}
                  </>
                )}
              </Text>
            }
          >
            <Text weight="2">{itogoT}</Text>
          </Cell>
        </Section>

        {/* Система лояльности */}
        {!allItemsOnSale && (
          <Section header={LoyaltySystemT}>
            <TabsList>
              <TabsItem
                onClick={() => handleTabChange(1)}
                selected={state.settings.selectedTab === 1}
              >
                {toAddCashbackT}
              </TabsItem>

              <TabsItem
                onClick={() => handleTabChange(2)}
                selected={state.settings.selectedTab === 2}
              >
                {promocodeT}
              </TabsItem>

              <TabsItem
                onClick={() => handleTabChange(3)}
                selected={state.settings.selectedTab === 3}
              >
                {writeOffT}
              </TabsItem>
            </TabsList>

            {/* Таб начисления кешбэка */}
            {state.settings.selectedTab === 1 && (
              <Cell
                multiline
                after={
                  state.ui.isLoadingSum ? (
                    <Spinner size="s" />
                  ) : (
                    `${state.cashback.willBeCashbacked} ${state.cart.valuteToShowOnFront} (${state.cashback.currentPercent}%)`
                  )
                }
              >
                {willAddWhenPurchaseT}
              </Cell>
            )}

            {/* Таб промокода */}
            {state.settings.selectedTab === 2 && (
              <>
                <Input
                  status="focused"
                  header={enterPromocodeT}
                  placeholder={promocodePlaceholderT}
                  value={state.promocode.value}
                  onChange={handlePromocodeChange}
                  after={
                    <Tappable Component="div" style={STYLES.flexContainer} onClick={handleApplyPromocode}>
                      <Chip mode="outline" style={STYLES.chipButton}>
                        {state.ui.isPromocodeLoading ? <Spinner size="s" /> : applyT}
                      </Chip>
                    </Tappable>
                  }
                />

                {state.promocode.isShowInfoText && (
                  <Text
                    weight="3"
                    style={{
                      paddingLeft: 22,
                      color: state.promocode.infoType === 'success' ? 'green' : 'red',
                    }}
                  >
                    {state.promocode.infoText}
                  </Text>
                )}
              </>
            )}

            {/* Таб списания кешбэка */}
            {state.settings.selectedTab === 3 && (
              <>
                {!state.promocode.isShowInfoText && !state.cashback.isRunoutShow && (
                  <Cell
                    after={
                      <Tappable Component="span" style={STYLES.flexContainer} onClick={handleWriteOffCashback}>
                        <Chip mode="outline" style={STYLES.chipButtonWide}>
                          {state.ui.isPromocodeLoading ? <Spinner size="s" /> : writeoffT}
                        </Chip>
                      </Tappable>
                    }
                  >
                    {useCashbackT} {state.cashback.enteredValue}
                  </Cell>
                )}

                {state.promocode.isShowInfoText && !state.cashback.isRunoutShow && (
                  <Text
                    weight="3"
                    style={{
                      paddingLeft: 22,
                      color: state.promocode.infoType === 'success' ? 'green' : 'red',
                    }}
                  >
                    {state.promocode.infoText}
                  </Text>
                )}

                {state.cashback.isRunoutShow && (
                  <Cell subtitle={zeroCashbackInfoT} multiline>
                    {zeroCashbackT}
                  </Cell>
                )}
              </>
            )}
          </Section>
        )}

        {/* Кнопка оплаты */}
        <Section style={STYLES.bottomSection}>
          <Button stretched onClick={handlePayment} disabled={!state.cart.cart || state.cart.cart.length === 0}>
            {payBtn2T}
          </Button>
        </Section>
      </List>

      {/* Snackbar уведомлений */}
      {state.ui.openSnackbar && (
        <Snackbar duration={3000} onClose={handleCloseSnackbar}>
          {state.ui.snackbarMessage}
        </Snackbar>
      )}

      <TabbarMenu />
    </Page>
  );
};
