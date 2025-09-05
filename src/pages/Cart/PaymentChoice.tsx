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
  const { cart: initialCart, deliveryInfo, deliveryRegion } = location.state || {}; 
  
  const [cart, setCart] = useState(initialCart || []);
  const [isLoading, setIsLoading] = useState(false);
  const [totalOrderSum, setTotalOrderSum] = useState(0);
  const [oldTotalOrderSum, setOldTotalOrderSum] = useState(0)
  const [isShowOldTotalOrderSum, setIsShowOldTotalOrderSum] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [valuteToShowOnFront,setValuteToShowOnFront] = useState('')
  const [promocodeValue, setPromocodeValue] = useState('')
  const [isPromocodeLoading, setIsPromocodeLoading] = useState(false)

  const [isShowPromocodeInfoText, setIsShowPromocodeInfoText] = useState(false)
  const [promocodeInfoText, setPromocodeInfoText] = useState('')
  const [promocodeInfoType, setPromocodeInfoType] = useState<'success' | 'error'>('error')
  

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

  // Функция для проверки промокода
  const handleApplyPromocode = async () => {
    
    if (!promocodeValue.trim()) {
      // setSnackbarMessage('Введите промокод');
      // setOpenSnackbar(true);

      setPromocodeInfoText('Введите промокод')
      setPromocodeInfoType('error')
      setIsShowPromocodeInfoText(true)

      return;
    }

    setIsPromocodeLoading(true);

    try {
      const response = await axios.post('/check_promocode', {
        code: promocodeValue.trim(),
        userId: tlgid
      });

      if (response.data.status === 'ok') {

        console.log('new cart with promo', response.data)

        setCart(response.data.goods)

         const total = response.data.goods.reduce((sum: number, item: any) => {
          const itemPrice = Number(item.priceToShow) || 0;
          const deliveryPrice = Number(item[`deliveryPriceToShow_${deliveryRegion}`]) || 0;
          const quantity = Number(item.qty) || 0;
          
          return sum + ((itemPrice + deliveryPrice) * quantity);
         }, 0);
      
         setOldTotalOrderSum(totalOrderSum)
         setTotalOrderSum(total);
         setIsShowOldTotalOrderSum(true);

        //  добавить текст для уведомления юзера
         setPromocodeInfoText(response.data.textForUser)
         setPromocodeInfoType('success')
         setIsShowPromocodeInfoText(true)

       


      }
    } catch (error: any) {
      console.error('Ошибка при проверке промокода:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при проверке промокода';
      // setSnackbarMessage(errorMessage);
      // setOpenSnackbar(true);

      setPromocodeInfoText(errorMessage)
      setPromocodeInfoType('error')
      setIsShowPromocodeInfoText(true)
      setPromocodeValue('')

    } finally {
      setIsPromocodeLoading(false);
    }
  };

  

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
                const priceWithoutPromo = Number(item.priceToShowNoPromoApplied) || 0
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
                    {!item.isWithPromoSale && 
                    <div>{priceGoodT} {(itemPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    }
                    {item.isWithPromoSale && 
                      <div>{priceGoodT} <span style={{textDecoration: 'line-through'}}>{(priceWithoutPromo*quantity).toFixed(2)}</span> {(itemPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    }

                    <div>{priceDeliveryT} {(deliveryPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    </>
                    }
                    // after={`${totalItemCost} ${item.valuteToShow}`}
                    after={ <Text weight="3">{totalItemCost} {item.valuteToShow}</Text>}
                  >
                    {item[`name_${language}`] || item.name_en}
                    {item.isSaleNow && ' (sale)'}
                  </Cell>
                );
              })}
            </Section>


            <Section>
              <Cell
              multiline
                after={
                  <Text weight="2" >
                    {/* {totalOrderSum.toFixed(2)} {valuteToShowOnFront} */}
                    {!isShowOldTotalOrderSum ? (`${totalOrderSum.toFixed(2)} ${valuteToShowOnFront}`) : (
                      <>
                        <span style={{textDecoration: 'line-through'}}>{oldTotalOrderSum.toFixed(2)}</span>
                        {` ${totalOrderSum.toFixed(2)} ${valuteToShowOnFront}`}
                      </>
                    )}
                  </Text>
                }
              >
                <Text weight="2" >
                  {itogoT}
                </Text>
              </Cell>

            </Section>


            {/* условный вывод Section - скрываем если у всех товаров isSaleNow = true */}
            {!cart.every((item: any) => item.isSaleNow) && (
            <Section>

             <Input 
             status="focused" 
             header="Input" 
             placeholder="Введите промокод" 
             value={promocodeValue} 
             onChange={e => {setPromocodeValue(e.target.value); setIsShowPromocodeInfoText(false);}} 
             after={
                <Tappable Component="div" 
                  style={{display: 'flex'}} 
                  onClick={handleApplyPromocode}>
                <Chip 
                mode="outline" 
                style={{backgroundColor:'#a2d7f6ff', padding: '3px 15px 3px 15px', color: 'white'}}
                >
                  {isPromocodeLoading ? <Spinner size="s" /> : 'apply'}
                </Chip>
                </Tappable>} 
              />
              { isShowPromocodeInfoText &&
                <Text weight="3" style={{
                  paddingLeft: 22, 
                  color: promocodeInfoType === 'success' ? 'green' : 'red'
                }} >
                  {promocodeInfoText}
                </Text>

              }

              </Section>
            )}
            
            {/* FIXME: раскомменти */}
              {/* {currentPromocode && (
                <Section style={{ marginTop: 10 }}>
                  <Cell 
                    subtitle={`Скидка: ${currentPromocode.saleInPercent}%`}
                    before="🎉"
                  >
                    Промокод "{currentPromocode.code}" применён
                  </Cell>
                </Section>
              )} */}
              
              {/* <Section >

              
              </Section> */}


            <Section style={{ marginBottom: 100, padding: 10 }}>
              
              
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