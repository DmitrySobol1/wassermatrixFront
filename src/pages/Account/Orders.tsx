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
import { settingsButton, openLink } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import axios from '../../axios';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';



export const Orders: FC = () => {

  
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);
  const navigate = useNavigate();
  
  //@ts-ignore
  const { myOrdersT, orderFromT,currentStatusT, openReceiptT, deliveryAddressT, qtyT, priceGoodT, priceDeliveryT, itogoT,pcsT, notPaydT, payBtnT, loadingT, etaT, pressAsDeliveredT} = TEXTS[language];
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [valuteToShowOnFront, setValuteToShowOnFront] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [isButtonDeliveredLoading, setIsButtonDeliveredLoading] = useState(false)
  const [isShowDeliveredBtn, setIsShowDeliveredBtn] = useState(true)
  const [isShowReceipt, setIsShowReceipt] = useState(false)

  // Функция для управления открытием/закрытием аккордеонов
  const handleAccordionChange = (orderId: string) => {
    setIsShowReceipt(false)
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
  }, [tlgid, isShowDeliveredBtn]);


  // Обработчик для кнопки "Чек"
  const handleReceipt = async (paymentIntent: string) => {
    setIsButtonLoading(true);

    try {
      // Отправляем запрос на получение URL чека
      const response = await axios.get('/get_receipt', {
        params: { payment_intent: paymentIntent }
      });

      if (response.data.status === 'ok' && response.data.url) {
        // Открываем URL чека внутри Telegram Mini App
        // setReceiptUrl(response.data.url)
        // setIsShowReceipt(true)
        // setIsButtonLoading(false);
        
        // Используем Telegram API для открытия ссылки
        if (openLink.isAvailable()) {
          openLink(response.data.url);
        } else {
          // Fallback для разработки вне Telegram
          window.open(response.data.url);
        }
      } else {
        setIsShowReceipt(true)
        setIsButtonLoading(false);
      }
    } catch (error) {
      console.error('Ошибка при получении чека:', error);
      setIsShowReceipt(true)
    } finally {
      setIsButtonLoading(false);
    }
  };
  
  // Обработчик для кнопки "заказ доставлен"
  const handleDelivered = async (orderid: string) => {
    setIsButtonDeliveredLoading(true);

    try {
      // Отправляем запрос на получение URL чека
      const response = await axios.post('/change_orderInfo', 
        { orderid: orderid, tlgid: tlgid}
      );

      if (response.data.status === 'changed') {
          console.log('пометил как полученный')
          setIsShowDeliveredBtn(false)
        } else {
          console.log('пометил как НЕ полученный')
        }
      } catch (error) {
      console.error('Ошибка при отметке заказа полученным', error);
      // setIsShowReceipt(true)
    } finally {
      setIsButtonDeliveredLoading(false);
    }
  };

  

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
            <Section header={myOrdersT} style={{ marginBottom: 100 }}> 
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
                     

                      <Accordion
                        expanded={expandedOrderId === order._id}
                        onChange={() => handleAccordionChange(order._id)}
                      >
                        <AccordionSummary>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Text weight="2">
                              {orderFromT}{' '} 
                              {new Date(order.createdAt).toLocaleDateString(
                                'ru-RU'
                              )}
                            </Text>
                             {order.payStatus === true ?
                              (<span style={{backgroundColor: '#e6f2f9', color:'#40a7e3', padding:'3px 5px 3px 5px', borderRadius:10, marginLeft: 10 }}>{order.orderStatus?.[`name_${language}`]}</span>)
                              :
                              (<span style={{backgroundColor: 'coral', color:'white', padding:'3px 5px 3px 5px', borderRadius:10, marginLeft: 10 }}>{notPaydT}</span>)
                             }
                           
                          </div>
                        </AccordionSummary>
                        <AccordionContent>
                          <Cell subhead={currentStatusT}>
                            {order.payStatus === false ? (
                              <span style={{ color: 'red', fontWeight: 600 }}>
                                {notPaydT}
                              </span>
                            ) : (
                              <div>
                                {order.orderStatus?.[`name_${language}`]}
                                {(order.eta && order.orderStatus._id != '689b8af622baabcbb7047b9e') && (
                                  <div style={{ fontSize: '0.875rem', color: '#000000ff', marginTop: 5 }}>
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
                                loading = {isButtonDeliveredLoading}
                                style={{backgroundColor:'#8be78b', color: 'black'}}
                              >
                                {pressAsDeliveredT}
                              </Button>
                            </Cell>
                          )}

                          {order.payStatus === true && (
                            <Cell>
                              <Button 
                                onClick={() => handleReceipt(order.payment_intent)}
                                loading = {isButtonLoading}
                              >
                                {openReceiptT}
                              </Button>
                            </Cell>
                          )}

                          {isShowReceipt &&
                            <Cell multiline>чек не доступен</Cell>
                          }

                          {order.payStatus === false && (
                            <Button
                              style={{ marginLeft: 20 }}
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
                                      <div>{qtyT} {quantity} {pcsT}</div>
                                      <div>
                                        {priceGoodT}{' '}
                                        {(itemPrice * quantity).toFixed(2)}{' '}
                                        {valuteToShowOnFront}
                                      </div>
                                      <div>
                                        {priceDeliveryT}{' '}
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
                              <Text weight="2">{itogoT}</Text>
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
