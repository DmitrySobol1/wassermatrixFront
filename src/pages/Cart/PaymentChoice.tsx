import {
  Section,
  Spinner,
  Button,
  List,
  Cell,
  Text,
  Snackbar,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import axios from '../../axios';

export const PaymentChoice: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);
  const navigate = useNavigate();

  const location = useLocation();
  const { cart, deliveryInfo, deliveryRegion } = location.state || {}; 
  
  const [isLoading, setIsLoading] = useState(false);
  const [totalOrderSum, setTotalOrderSum] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [valuteToShowOnFront,setValuteToShowOnFront] = useState('')

  //@ts-ignore
  const { payBtn,priceDeliveryT, header2T, qtyT, priceGoodT, pcsT, itogoT, payBtn2T } = TEXTS[language];

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


  // Вычисляем общую сумму заказа
  useEffect(() => {

    console.log('Cart', cart)

    if (cart && cart.length > 0) {
      setValuteToShowOnFront(cart[0].valuteToShow)
      const total = cart.reduce((sum: number, item: any) => {
        const itemPrice = Number(item.priceToShow) || 0;
        const deliveryPrice = Number(item[`deliveryPriceToShow_${deliveryRegion}`]) || 0;
        const quantity = Number(item.qty) || 0;
        
        return sum + ((itemPrice + deliveryPrice) * quantity);
      }, 0);
      
      setTotalOrderSum(total);
    }
  }, []);


  // const handleOrder = async () => {
  //   if (!cart || !deliveryInfo) {
  //     setSnackbarMessage('Ошибка: отсутствуют данные заказа');
  //     setOpenSnackbar(true);
  //     return;
  //   }

  //   setIsLoading(true);

  //   console.log("HERE", deliveryInfo )
  //   // return

  //   try {
  //     // Подготавливаем данные для заказа
  //     const orderData = {
  //       tlgid: tlgid,
  //       jbid: null,
  //       goods: cart.map((item: any) => ({
  //         itemId: item.itemId,
  //         qty: item.qty
  //       })),
  //       country: deliveryInfo.selectedCountry.name_en,
  //       regionDelivery: deliveryRegion,
  //       address: deliveryInfo.address,
  //       phone: deliveryInfo.phone,
  //       name: deliveryInfo.userName
  //     };

  //     console.log('Отправляем заказ:', orderData);

  //     // Отправляем запрос на создание заказа
  //     const response = await axios.post('/create_order', orderData);
      
  //     if (response.data.status === 'ok') {
  //       // Переходим на страницу успешного оформления заказа
  //       navigate('/success-page');
  //     } else {
  //       throw new Error(response.data.message || 'Ошибка при создании заказа');
  //     }
  //   } catch (error) {
  //     console.error('Ошибка при создании заказа:', error);
  //     setSnackbarMessage('Ошибка при оформлении заказа. Попробуйте еще раз.');
  //     setOpenSnackbar(true);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Обработчик для кнопки "Оплата" - перенаправление на Stripe
  const handlePayment = async () => {
    if (!cart || !deliveryInfo) {
      setSnackbarMessage('Ошибка: отсутствуют данные заказа');
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);

    try {
      // Подготавливаем данные для Stripe Checkout
      const paymentData = {
        cart: cart,
        deliveryInfo: deliveryInfo,
        totalSum: totalOrderSum,
        region: deliveryRegion,
        tlgid: tlgid
      };

      console.log('Создаем Stripe Checkout Session:', paymentData);

      // Отправляем запрос на создание Stripe Checkout Session
      const response = await axios.post('/create_payment_session', paymentData);
      
      if (response.data.status === 'ok') {
        // Перенаправляем пользователя на Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error(response.data.message || 'Ошибка при создании сессии оплаты');
      }
    } catch (error) {
      console.error('Ошибка при создании сессии оплаты:', error);
      setSnackbarMessage('Ошибка при переходе к оплате. Попробуйте еще раз.');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart) {
    return (
      <Page back={true}>
        <Section>
          <Cell>Корзина пуста</Cell>
        </Section>
        <TabbarMenu />
      </Page>
    );
  }  

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
            <Section header={header2T}>
              {cart.map((item: any) => {
                const itemPrice = Number(item.priceToShow) || 0;
                const deliveryPrice = Number(item[`deliveryPriceToShow_${deliveryRegion}`]) || 0;
                const quantity = Number(item.qty) || 0;
                const totalItemCost = ((itemPrice + deliveryPrice) * quantity).toFixed(2);

                return (
                  <Cell
                    key={item.itemId}
                    multiline
                    description={
                    <>
                    <div>{qtyT} {quantity} {pcsT}</div> 
                    <div>{priceGoodT} {(itemPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    <div>{priceDeliveryT} {(deliveryPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    </>
                    }
                    // after={`${totalItemCost} ${item.valuteToShow}`}
                    after={ <Text weight="3">{totalItemCost} {item.valuteToShow}</Text>}
                  >
                    {/* <Text weight="2"> */}
                      {item[`name_${language}`] || item.name_en}
                    {/* </Text> */}
                  </Cell>
                );
              })}
            </Section>


            <Section>
              <Cell
              multiline
                after={
                  <Text weight="2" >
                    {totalOrderSum.toFixed(2)} {valuteToShowOnFront}
                  </Text>
                }
              >
                <Text weight="2" >
                  {itogoT}
                </Text>
              </Cell>
            </Section>

            <Section style={{ marginBottom: 100, padding: 10 }}>
              {/* <Button 
                stretched 
                onClick={handleOrder}
                disabled={!cart || cart.length === 0}
              >
                Оформить заказ
              </Button> */}
              
              <Button 
                stretched 
                onClick={handlePayment}
                disabled={!cart || cart.length === 0}
              >
                {payBtn2T }
              </Button>
            </Section>
          </List>

          {openSnackbar && (
            <Snackbar duration={3000} onClose={() => setOpenSnackbar(false)}>
              {snackbarMessage}
            </Snackbar>
          )}

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};