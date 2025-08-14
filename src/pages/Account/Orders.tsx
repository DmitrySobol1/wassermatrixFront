import {
  Section,
  Spinner,
  Cell,
  Text,
  List,
  Accordion,
  Button,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
// import { TEXTS } from './texts.ts';
import axios from '../../axios';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';

export const Orders: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [valuteToShowOnFront, setValuteToShowOnFront] = useState('');

  // Функция для управления открытием/закрытием аккордеонов
  const handleAccordionChange = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Обработчик для кнопки "Оплатить"
  const handlePayment = async (order: any) => {
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
  };

  if (settingsButton.mount.isAvailable()) {
    settingsButton.mount();
    settingsButton.isMounted();
    settingsButton.show();
  }

  if (settingsButton.onClick.isAvailable()) {
    function listener() {
      console.log('Clicked!');
      navigate('/setting-button-menu');
    }
    settingsButton.onClick(listener);
  }

  // для получения данных о моих заказах из БД OrdersModel
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setIsLoading(true);
        // endpoint для получения информации, поиск заказов по tlgid
        const response = await axios.get(`/user_get_my_orders?tlgid=${tlgid}`);

        console.log('my orders=', response.data);
        setMyOrders(response.data.orders);
        setValuteToShowOnFront(response.data.valuteToShow);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tlgid) {
      fetchMyOrders();
    }
  }, [tlgid]);

  return (
    <Page back={true}>
      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            justifyContent: 'center',
            padding: '100px',
          }}
        >
          <Spinner size="m" />
        </div>
      )}

      {!isLoading && (
        <>
          <List>
            <Section header="Мои заказы" style={{ marginBottom: 100 }}>
              {myOrders && myOrders.length > 0 ? (
                myOrders.map((order: any) => {
                  // посчитать общую сумму заказа с учетом стоимости доставки
                  // const totalSum = order.goods?.reduce((sum: number, item: any) => {
                  //   const itemPrice = Number(item.priceToShow) || 0;
                  //   const deliveryPrice = Number(item[`delivery_price_${order.regionDelivery}`]) || 0;
                  //   const quantity = Number(item.qty) || 0;

                  //   return sum + ((itemPrice + deliveryPrice) * quantity);
                  // }, 0) || 0;

                  return (
                    <>
                      {/* <Cell
                      key={order._id}
                      multiline
                      subtitle={`${totalSum.toFixed(2)} ${order.valuteToShow || valute} • ${order.country}`}
                     after={order.orderStatus?.[`name_${language}`]}
                    >
                      <Text weight="2">
                        Заказ от {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </Text>
                    </Cell> */}

                      <Accordion
                        expanded={expandedOrderId === order._id}
                        onChange={() => handleAccordionChange(order._id)}
                      >
                        <AccordionSummary>
                          <Text weight="2">
                            Заказ от{' '}
                            {new Date(order.createdAt).toLocaleDateString(
                              'ru-RU'
                            )}{' '}
                            {order.payStatus === false ? (
                              <span style={{ color: 'red' }}>(не оплачен)</span>
                            ) : (
                              ''
                            )}
                          </Text>
                        </AccordionSummary>
                        <AccordionContent>
                          <Cell subhead="Текущий статус заказа">
                            {order.payStatus === false ? (
                              <span style={{ color: 'red', fontWeight: 600 }}>
                                не оплачен
                              </span>
                            ) : (
                              order.orderStatus?.[`name_${language}`]
                            )}
                          </Cell>

                          {order.payStatus === false && (
                            <Button
                              style={{ marginLeft: 20 }}
                              onClick={() => handlePayment(order)}
                              disabled={paymentLoading}
                            >
                              {paymentLoading ? 'Загрузка...' : 'Оплатить'}
                            </Button>
                          )}

                          <Cell multiline subhead="Адрес доставки">
                            {order.country}, {order.adress}
                          </Cell>

                          <List>
                            {order.goods.map((item: any, index: number) => {
                              const itemPrice = Number(item.priceToShow) || 0;
                              const deliveryPrice =
                                Number(item.convertedDeliveryPrice) || 0;
                              const quantity = Number(item.qty) || 0;
                              const totalItemCost =
                                (itemPrice + deliveryPrice) * quantity;

                              return (
                                <Cell
                                  key={`${item.itemId}-${index}`}
                                  multiline
                                  description={
                                    <>
                                      <div>Кол-во: {quantity} шт.</div>
                                      <div>
                                        Стоимость товара:{' '}
                                        {(itemPrice * quantity).toFixed(2)}{' '}
                                        {valuteToShowOnFront}
                                      </div>
                                      <div>
                                        Стоимость доставки:{' '}
                                        {(deliveryPrice * quantity).toFixed(2)}{' '}
                                        {valuteToShowOnFront}
                                      </div>
                                    </>
                                  }
                                  after={
                                    <Text weight="3">
                                      {totalItemCost.toFixed(2)}{' '}
                                      {valuteToShowOnFront}
                                    </Text>
                                  }
                                >
                                  {item[`name_${language}`] || item.name_en}
                                </Cell>
                              );
                            })}
                          </List>

                          {/* Информация о заказе */}
                          <Section>
                            <Cell
                              multiline
                              after={
                                <Text weight="3">
                                  {order.goods
                                    .reduce((total: number, item: any) => {
                                      const itemPrice =
                                        Number(item.priceToShow) || 0;
                                      const deliveryPrice =
                                        Number(item.convertedDeliveryPrice) ||
                                        0;
                                      const quantity = Number(item.qty) || 0;
                                      return (
                                        total +
                                        (itemPrice + deliveryPrice) * quantity
                                      );
                                    }, 0)
                                    .toFixed(2)}{' '}
                                  {valuteToShowOnFront}
                                </Text>
                              }
                            >
                              <Text weight="2">Общая стоимость:</Text>
                            </Cell>

                            {/* <Cell 
                            description="Текущий статус заказа"
                          >
                            <Text weight="2">
                              Статус: {order.orderStatus?.[`name_${language}`] || order.orderStatus?.name_en || 'Неизвестно'}
                            </Text>
                          </Cell> */}

                            {/* <Cell 
                            multiline
                            subhead="Адрес доставки"
                          >
                            
                              {order.country}, {order.adress}
                            
                          </Cell> */}
                          </Section>
                        </AccordionContent>
                      </Accordion>
                    </>
                  );
                })
              ) : (
                <Cell>
                  <Text>У вас пока нет заказов</Text>
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
