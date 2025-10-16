/**
 * Страница "Мои заказы"
 *
 * Отображает историю заказов пользователя с детальной информацией о каждом заказе.
 *
 * Основные возможности:
 * - Загрузка истории заказов пользователя через API (/user_get_my_orders)
 * - Отображение заказов с expandable аккордеонами
 * - Информация о статусе оплаты и доставки
 * - Повторная оплата неоплаченных заказов (Stripe integration)
 * - Просмотр чеков оплаченных заказов (/get_receipt)
 * - Отметка заказа как доставленного (/change_orderInfo)
 * - Детальная информация по каждому товару в заказе
 * - Автоматический расчет стоимости с учетом доставки
 * - Мультиязычность (ru, en, de)
 * - Мультивалютность
 *
 * Оптимизации производительности:
 * - Мемоизация всех обработчиков событий (useCallback)
 * - Мемоизация сложных вычислений заказов (useMemo) - предотвращает O(n²) сложность
 * - Мемоизация текстовых переводов (useMemo)
 * - Вынос всех стилей в константы (предотвращает создание новых объектов)
 * - Правильная очистка settingsButton listener (предотвращает утечку памяти)
 * - Локальное обновление состояния без дополнительных API запросов
 * - Корректные зависимости useEffect (устранены лишние API запросы)
 * - Обработка ошибок с UI для повторной попытки
 * - Функциональное обновление состояния (prevState pattern)
 */
import {
  Section,
  Spinner,
  Cell,
  Text,
  List,
  Accordion,
  Button,
  Caption,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton, openLink } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import axios from '../../axios';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';

// ============================================================================
// Константы стилей
// ============================================================================
// Константы стилей для предотвращения создания новых объектов при каждом рендере
const styles = {
  loadingContainer: {
    textAlign: 'center' as const,
    justifyContent: 'center',
    padding: '100px',
  },
  accordionSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  paidBadge: {
    backgroundColor: '#e6f2f9',
    color: '#40a7e3',
    padding: '3px 5px',
    borderRadius: 10,
    marginLeft: 10,
  },
  unpaidBadge: {
    backgroundColor: '#ed6c02',
    color: 'white',
    padding: '3px 5px',
    borderRadius: 10,
    marginLeft: 10,
  },
  unpaidText: {
    color: '#ed6c02',
    fontWeight: 600,
  },
  etaText: {
    fontSize: '0.875rem',
    color: '#000000ff',
    marginTop: 5,
  },
  deliveredButton: {
    backgroundColor: '#8be78b',
    color: 'black',
  },
  paymentButton: {
    marginLeft: 20,
  },
  sectionMargin: {
    marginBottom: 100,
  },

} as const;

const ERROR_MESSAGE_STYLE: React.CSSProperties = {
  color: 'red',
  marginBottom: '10px',
};

// ============================================================================
// Основной компонент
// ============================================================================

/**
 * Компонент страницы "Мои заказы"
 *
 * Отображает список заказов с детальной информацией, возможностью оплаты,
 * просмотра чеков и отметки доставки.
 */
export const Orders: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);
  const navigate = useNavigate();

  // Мемоизация текстов для избежания повторной деструктуризации при каждом рендере
  const texts = useMemo(() => TEXTS[language as keyof typeof TEXTS], [language]);
  const { myOrdersT, orderFromT, currentStatusT, openReceiptT, deliveryAddressT, qtyT, priceGoodT, priceDeliveryT, itogoT, pcsT, notPaydT, payBtnT, loadingT, etaT, pressAsDeliveredT, errorT, btnErrorT, noOrderT} = texts;
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [valuteToShowOnFront, setValuteToShowOnFront] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isButtonDeliveredLoading, setIsButtonDeliveredLoading] = useState(false);
  const [isShowDeliveredBtn, setIsShowDeliveredBtn] = useState(true);
  const [isShowReceipt, setIsShowReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для управления открытием/закрытием аккордеонов (мемоизирована)
  const handleAccordionChange = useCallback((orderId: string) => {
    setIsShowReceipt(false);
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  }, []);

  // Обработчик для кнопки "Оплатить" (мемоизирован)
  const handlePayment = useCallback(async (order: any) => {
    setPaymentLoading(true);

    try {
      // Отправляем запрос на создание новой Stripe Checkout Session для существующего заказа
      const response = await axios.post('/repay_order', {
        orderId: order._id,
        tlgid: tlgid,
      });

      if (response.data.status === 'ok') {
        // Перенаправляем пользователя на Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error(
          response.data.message || 'Ошибка при создании сессии оплаты'
        );
      }
    } catch (error) {
      console.error('Ошибка при переходе к оплате:', error);

    } finally {
      setPaymentLoading(false);
    }
  }, [tlgid]);

  // Инициализация кнопки настроек Telegram с правильной очисткой
  useEffect(() => {
    if (!settingsButton.mount.isAvailable() || !settingsButton.onClick.isAvailable()) {
      return;
    }

    settingsButton.mount();
    settingsButton.isMounted();
    settingsButton.show();

    const handleSettingsClick = () => {
      console.log('Clicked!');
      navigate('/setting-button-menu');
    };

    settingsButton.onClick(handleSettingsClick);

    // Cleanup функция для предотвращения утечки памяти
    return () => {
      // Удаляем обработчик события при размонтировании
      try {
        if (settingsButton.offClick && typeof settingsButton.offClick === 'function') {
          settingsButton.offClick(handleSettingsClick);
        }
      } catch (e) {
        console.log('Settings button cleanup:', e);
      }
    };
  }, [navigate]);

  // для получения данных о моих заказах из БД OrdersModel
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setIsLoading(true);
        setError(null); // Сбрасываем предыдущую ошибку
        // endpoint для получения информации, поиск заказов по tlgid
        const response = await axios.get(`/user_get_my_orders?tlgid=${tlgid}`);

        console.log('my orders=', response.data);
        setMyOrders(response.data.orders);
        setValuteToShowOnFront(response.data.valuteToShow);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        setError('Не удалось загрузить заказы. Проверьте интернет-соединение.');
      } finally {
        setIsLoading(false);
      }
    };

    if (tlgid) {
      fetchMyOrders();
    }
  }, [tlgid]); // Убрали isShowDeliveredBtn из зависимостей


  // Обработчик для кнопки "Чек" (мемоизирован)
  const handleReceipt = useCallback(async (paymentIntent: string) => {
    setIsButtonLoading(true);

    try {
      // Отправляем запрос на получение URL чека
      const response = await axios.get('/get_receipt', {
        params: { payment_intent: paymentIntent }
      });

      if (response.data.status === 'ok' && response.data.url) {
        // Используем Telegram API для открытия ссылки
        if (openLink.isAvailable()) {
          openLink(response.data.url);
        } else {
          // Fallback для разработки вне Telegram
          window.open(response.data.url);
        }
      } else {
        setIsShowReceipt(true);
        setIsButtonLoading(false);
      }
    } catch (error) {
      console.error('Ошибка при получении чека:', error);
      setIsShowReceipt(true);
    } finally {
      setIsButtonLoading(false);
    }
  }, []);

  // Обработчик для кнопки "заказ доставлен" (мемоизирован с локальным обновлением state)
  const handleDelivered = useCallback(async (orderid: string) => {
    setIsButtonDeliveredLoading(true);

    try {
      const response = await axios.post('/change_orderInfo',
        { orderid: orderid, tlgid: tlgid }
      );

      if (response.data.status === 'changed') {
        console.log('пометил как полученный');
        // Локальное обновление без повторного запроса к серверу
        setMyOrders(prevOrders =>
          prevOrders.map((order: any) =>
            order._id === orderid
              ? { ...order, isDelivered: true }
              : order
          )
        );
        setIsShowDeliveredBtn(false);
      } else {
        console.log('пометил как НЕ полученный');
      }
    } catch (error) {
      console.error('Ошибка при отметке заказа полученным', error);
    } finally {
      setIsButtonDeliveredLoading(false);
    }
  }, [tlgid]);

  // Мемоизация вычислений заказов для предотвращения повторных расчетов при каждом рендере
  const ordersWithCalculations = useMemo(() => {
    if (!myOrders || myOrders.length === 0) return [];

    return myOrders.map((order: any) => {
      const itemsWithTotals = order.goods.map((item: any, index: number) => {
        const itemPrice = Number(item.priceToShow) || 0;
        const deliveryPrice = Number(item.convertedDeliveryPrice) || 0;
        const quantity = Number(item.qty) || 0;
        const totalItemCost = (itemPrice + deliveryPrice) * quantity;

        return {
          ...item,
          itemPrice,
          deliveryPrice,
          quantity,
          totalItemCost,
          itemSubtotal: itemPrice * quantity,
          deliverySubtotal: deliveryPrice * quantity,
          index, // Сохраняем индекс для ключа
        };
      });

      const orderTotal = itemsWithTotals.reduce(
        (sum: number, item: any) => sum + item.totalItemCost,
        0
      );

      return {
        ...order,
        goods: itemsWithTotals,
        orderTotal,
      };
    });
  }, [myOrders]);

  return (
    <Page back={true}>
      {isLoading && (
        <div style={styles.loadingContainer}>
          <Spinner size="m" />
        </div>
      )}


      {error && !isLoading && (
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
      )}

      {!isLoading && !error && (
        <>
          <List>
            <Section header={myOrdersT} style={styles.sectionMargin}>
              {ordersWithCalculations && ordersWithCalculations.length > 0 ? (
                ordersWithCalculations.map((order: any) => {

                  return (
                    <>
                     

                      <Accordion
                        expanded={expandedOrderId === order._id}
                        onChange={() => handleAccordionChange(order._id)}
                      >
                        <AccordionSummary>
                          <div style={styles.accordionSummary}>
                            <Text weight="2">
                              {orderFromT}{' '}
                              {new Date(order.createdAt).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit'
                              })}
                            </Text>
                             {order.payStatus === true ? (
                              <span style={styles.paidBadge}>
                                <Caption level="1" weight="3">
                                  {order.orderStatus?.[`name_${language}`]}
                                </Caption>
                              </span>
                             ) : (
                              <span style={styles.unpaidBadge}>
                                <Caption level="1" weight="3">
                                  {notPaydT}
                                </Caption>
                              </span>
                             )}
                          </div>
                        </AccordionSummary>
                        <AccordionContent>
                          <Cell subhead={currentStatusT}>
                            {order.payStatus === false ? (
                              <span style={styles.unpaidText}>
                                {notPaydT}
                              </span>
                            ) : (
                              <div>
                                {order.orderStatus?.[`name_${language}`]}
                                {(order.eta && order.orderStatus._id !== '689b8af622baabcbb7047b9e') && (
                                  <div style={styles.etaText}>
                                    {etaT} {new Date(order.eta).toLocaleDateString('ru-RU')}
                                  </div>
                                )}
                              </div>
                            )}
                          </Cell>

                          {order.orderStatus._id === '689b8ace384ddd696a12e0ec' && isShowDeliveredBtn && (
                            <Cell>
                              <Button
                                onClick={() => handleDelivered(order._id)}
                                loading={isButtonDeliveredLoading}
                                style={styles.deliveredButton}
                              >
                                {pressAsDeliveredT}
                              </Button>
                            </Cell>
                          )}

                          {order.payStatus === true && (
                            <Cell>
                              <Button
                                onClick={() => handleReceipt(order.payment_intent)}
                                loading={isButtonLoading}
                              >
                                {openReceiptT}
                              </Button>
                            </Cell>
                          )}

                          {isShowReceipt && (
                            <Cell multiline>чек не доступен</Cell>
                          )}

                          {order.payStatus === false && (
                            <Button
                              style={styles.paymentButton}
                              onClick={() => handlePayment(order)}
                              disabled={paymentLoading}
                            >
                              {paymentLoading ? loadingT : payBtnT}
                            </Button>
                          )}

                          <Cell multiline subhead={deliveryAddressT}>
                            {order.country}, {order.adress}
                          </Cell>

                          <List>
                            {order.goods.map((item: any) => (
                              <Cell
                                key={`${item.itemId}-${item.index}`}
                                multiline
                                description={
                                  <>
                                    <div>{qtyT} {item.quantity} {pcsT}</div>
                                    <div>
                                      {priceGoodT}{' '}
                                      {item.itemSubtotal.toFixed(2)}{' '}
                                      {valuteToShowOnFront}
                                    </div>
                                    <div>
                                      {priceDeliveryT}{' '}
                                      {item.deliverySubtotal.toFixed(2)}{' '}
                                      {valuteToShowOnFront}
                                    </div>
                                  </>
                                }
                                after={
                                  <Text weight="3">
                                    {item.totalItemCost.toFixed(2)}{' '}
                                    {valuteToShowOnFront}
                                  </Text>
                                }
                              >
                                {item[`name_${language}`] || item.name_en}
                              </Cell>
                            ))}
                          </List>

                          {/* Информация о заказе */}
                          <Section>
                            <Cell
                              multiline
                              after={
                                <Text weight="3">
                                  {order.orderTotal.toFixed(2)}{' '}
                                  {valuteToShowOnFront}
                                </Text>
                              }
                            >
                              <Text weight="2">{itogoT}</Text>
                            </Cell>
                          </Section>
                        </AccordionContent>
                      </Accordion>
                    </>
                  );
                })
              ) : (
                <Cell multiline>
                  <Text>{noOrderT}</Text>
                </Cell>
              )}
            </Section>
          </List>

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
