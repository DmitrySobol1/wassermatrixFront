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
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import axios from '../../axios';
import { TabsItem } from '@telegram-apps/telegram-ui/dist/components/Navigation/TabsList/components/TabsItem/TabsItem';

export const PaymentChoice: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);
  const navigate = useNavigate();

  const location = useLocation();
  const { cart: initialCart, deliveryInfo, deliveryRegion } = location.state || {}; 
  
  const [cart, setCart] = useState(initialCart || []);
  // const [rebootedCartPrice, setRebootedCartPrice] = useState(initialCart || []);
  const [rebootedCartPrice] = useState(initialCart || []);
  const [rebootedTotalCartPrice, setRebootedTotalCartPrice] = useState (0)
  const [isLoading, setIsLoading] = useState(false);
  const [totalOrderSum, setTotalOrderSum] = useState(0);
  const [oldTotalOrderSum, setOldTotalOrderSum] = useState(0)
  const [isShowOldTotalOrderSum, setIsShowOldTotalOrderSum] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [valuteToShowOnFront,setValuteToShowOnFront] = useState('')
  const [promocodeValue, setPromocodeValue] = useState('')
  const [cashbackValue, setCashbackValue] = useState('0') // Доступные баллы из БД
  const [enteredCashbackValue, setEnteredCashbackValue] = useState('') // Введенное количество баллов
  const [isPromocodeLoading, setIsPromocodeLoading] = useState(false)

  const [isShowPromocodeInfoText, setIsShowPromocodeInfoText] = useState(false)
  const [promocodeInfoText, setPromocodeInfoText] = useState('')
  const [promocodeInfoType, setPromocodeInfoType] = useState<'success' | 'error'>('error')
  const [currentPercent,setCurrentPercent] = useState(0)
  const [willBeCashbacked,setWillBeCashbacked] = useState(0)
  const [isLoadingSum, setIsLoadingSum] = useState(true)
  const [userValute, setUserValute] = useState('')
  const [isCashbackRunoutShow, setIsCashbackRunoutShow] = useState(false)
  const [selectedTab, setSelectedTab] = useState(1)
  const [typeLoyaltySystem, setTypeLoyaltySystem] = useState('addCashback')

  //@ts-ignore
  const { payBtn,priceDeliveryT, header2T, qtyT, priceGoodT, pcsT, itogoT, payBtn2T, enterPromocodeT, promocodePlaceholderT,applyT, useCashbackT,cashbackPlaceholderT,writeoffT,zeroCashbackT,zeroCashbackInfoT,availableCashbackT, willAddWhenPurchaseT,toAddCashbackT,promocodeT, writeOffT, LoyaltySystemT } = TEXTS[language];

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
   
    const fetchCashbackBalls = async () => {
   setIsLoadingSum(true)
      try {
        const ordersResponse = await axios.get('/user_get_orders', {
          params: { tlgid, payStatus: true }
        });

        const responseData = ordersResponse.data;
        
        setCashbackValue(responseData.cashbackBall.toString());
        setEnteredCashbackValue(`${responseData.cashbackBall} ${responseData.valute}`);
        
        setCurrentPercent(responseData.currentPercent);
        setUserValute(responseData.valute)
        
        const currentPercentForUseEffect = responseData.currentPercent

        if (responseData.cashbackBall == 0){
          setIsCashbackRunoutShow(true)
        }


        if (cart && cart.length > 0) {
        setValuteToShowOnFront(cart[0].valuteToShow);
        const total = cart.reduce((sum: number, item: any) => {
          const itemPrice = Number(item.priceToShow) || 0;
          const deliveryPrice = Number(item[`deliveryPriceToShow_${deliveryRegion}`]) || 0;
          const quantity = Number(item.qty) || 0;
          
          return sum + ((itemPrice + deliveryPrice) * quantity);
        }, 0);

        setTotalOrderSum(total);
        setRebootedTotalCartPrice(total)
        const countingWillBeCashbacked = (total * (Number(currentPercentForUseEffect) / 100)).toFixed(4);

        console.log('currentPercent', currentPercentForUseEffect);
        console.log('countingWillBeCashbacked', countingWillBeCashbacked);

        setWillBeCashbacked(Number(countingWillBeCashbacked));
        setIsLoadingSum(false)
      }

      } catch (error) {
        console.error('Error fetching cashback data:', error);
      }
    };


    fetchCashbackBalls();
}, []);

   


  // Функция для проверки промокода
  const handleApplyPromocode = async () => {
    
    if (!promocodeValue.trim()) {
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

         setTypeLoyaltySystem('usedPromocode')

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

  



  // Функция для списания баллов
  const handleWriteOffCashback = async () => {
    
    
    setIsPromocodeLoading(true);

    try {
      const response = await axios.post('/writeoff_cashback', {
        cashbackValue: cashbackValue,
        userId: tlgid
      });

      if (response.data.status === 'ok') {

        console.log('new cart with cashback', response.data)

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

         setTypeLoyaltySystem('writeOffCashback')

      }
    } catch (error: any) {
      console.error('Ошибка при проверке промокода:', error);
      // const errorMessage = error.response?.data?.message || 'Ошибка при проверке промокода';
      // setSnackbarMessage(errorMessage);
      // setOpenSnackbar(true);

      // setPromocodeInfoText(errorMessage)
      // setPromocodeInfoType('error')
      // setIsShowPromocodeInfoText(true)
      // setPromocodeValue('')

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

    console.log('typeLoyalty', typeLoyaltySystem)
    // return

    setIsLoading(true);

    try {
      // Подготавливаем данные для Stripe Checkout
      const paymentData = {
        cart: cart,
        deliveryInfo: deliveryInfo,
        totalSum: totalOrderSum,
        region: deliveryRegion,
        tlgid: tlgid,
        typeLoyaltySystem: typeLoyaltySystem,
        shouldBeCashbacked: willBeCashbacked,
        cashbackValute: userValute

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
                    

                    {/* promo=false */}
                    {!item.isWithPromoSale && !item.isWithCashbackSale &&
                    <div>{priceGoodT} {(itemPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    }
                                        
                    {/* promo=true */}
                    {item.isWithPromoSale && 
                      <div>{priceGoodT} <span style={{textDecoration: 'line-through'}}>{(priceWithoutPromo*quantity).toFixed(2)}</span> {(itemPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    }
                   
                    {/* cashback=true */}
                    {item.isWithCashbackSale && 
                      <div>{priceGoodT} <span style={{textDecoration: 'line-through'}}>{(priceWithoutPromo*quantity).toFixed(2)}</span> {(itemPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    }



                    <div>{priceDeliveryT} {(deliveryPrice*quantity).toFixed(2)} {item.valuteToShow}</div>
                    </>
                    }
                    // after={`${totalItemCost} ${item.valuteToShow}`}
                    after={ <Text weight="3">{totalItemCost} {item.valuteToShow}</Text>}
                  >
                    {item[`name_${language}`] || item.name_en}
                    {/* {item.isSaleNow && '(sale)'} */}
                    {item.isSaleNow && <span style={{color: 'white', backgroundColor: '#ed6c02', padding: 10,   marginLeft:20}}>sale</span>}
                  </Cell>
                );
              })}
            </Section>


            <Section>
              <Cell
              multiline
                after={
                  <Text weight="2" >
                    {isLoadingSum ? (
                      <Spinner size="s" />
                    ) : (
                      !isShowOldTotalOrderSum ? 
                      (`${totalOrderSum.toFixed(2)} ${valuteToShowOnFront}`) : 
                      (
                        <>
                          <span style={{textDecoration: 'line-through'}}>{oldTotalOrderSum.toFixed(2)}</span>
                          {` ${totalOrderSum.toFixed(2)} ${valuteToShowOnFront}`}
                        </>
                      )
                    )}
                  </Text>
                }
              >
                <Text weight="2" >
                  {itogoT}
                   
                </Text>
                
              </Cell>

            </Section>


            
            
           {/* если все товары по sale, то не показываем данную Section   */}
           {!cart.every((item: any) => item.isSaleNow) && ( 
           <Section
            header={LoyaltySystemT}
           >
            <TabsList>
                  
                  <TabsItem
                    onClick={() => {setSelectedTab(1); setTypeLoyaltySystem('addCashback'); setCart(rebootedCartPrice); setIsShowOldTotalOrderSum(false);  setTotalOrderSum(rebootedTotalCartPrice);setPromocodeValue(''); setIsShowPromocodeInfoText(false)}}
                    selected={selectedTab === 1 }
                  >
                    {toAddCashbackT}
                  </TabsItem>
                  
                  <TabsItem
                    onClick={() => {setSelectedTab(2) ; setCart(rebootedCartPrice); setIsShowOldTotalOrderSum(false);  setTotalOrderSum(rebootedTotalCartPrice); setPromocodeValue('');setIsShowPromocodeInfoText(false)}}
                    selected={selectedTab === 2 }
                  >
                    {promocodeT}
                  </TabsItem>
                  
                  <TabsItem
                    onClick={() => {setSelectedTab(3); setCart(rebootedCartPrice); setIsShowOldTotalOrderSum(false);  setTotalOrderSum(rebootedTotalCartPrice); setPromocodeValue(''); setIsShowPromocodeInfoText(false)}}
                    selected={selectedTab === 3}
                  >
                    {writeOffT}
                  </TabsItem>
           </TabsList>

           {selectedTab === 1 &&
              <Cell 
              multiline
              after={ isLoadingSum 
                        ? 
                        (<Spinner size="s" />)
                         :
                        `${willBeCashbacked} ${valuteToShowOnFront} (${currentPercent}%)`}
              >
                {willAddWhenPurchaseT}
              </Cell>
           }
           
           {selectedTab === 2 &&
              <>
                  <Input 
                    status="focused" 
                    header={enterPromocodeT}
                    placeholder={promocodePlaceholderT}
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
                          {isPromocodeLoading ? <Spinner size="s" /> : applyT }
                        </Chip>
                      </Tappable>
                    } 
                  />

                  { isShowPromocodeInfoText &&
                    <Text weight="3" style={{
                      paddingLeft: 22, 
                      color: promocodeInfoType === 'success' ? 'green' : 'red'
                    }} >
                      {promocodeInfoText}
                    </Text>
                  }
                </>
           
           }

           {selectedTab === 3 && 
           
            <>
                
                { !isShowPromocodeInfoText && !isCashbackRunoutShow &&
                
                    <Cell
                    after={
                        <Tappable Component="span" 
                          style={{display: 'flex'}} 
                          onClick={handleWriteOffCashback}>
                          <Chip 
                            mode="outline" 
                            style={{backgroundColor:'#a2d7f6ff', padding: '3px 10px 3px 10px', color: 'white', minWidth: 100, textAlign:'center'}}
                          >
                            {isPromocodeLoading ? <Spinner size="s" /> : writeoffT }
                          </Chip>
                        </Tappable>
                      }
                    >
                      {useCashbackT} {enteredCashbackValue}
                    </Cell>
                }

                { isShowPromocodeInfoText && !isCashbackRunoutShow &&
                    <Text weight="3" style={{
                      paddingLeft: 22, 
                      color: promocodeInfoType === 'success' ? 'green' : 'red'
                    }} >
                      {promocodeInfoText}
                    </Text>
                }

                { isCashbackRunoutShow && 
                  <Cell 
                  subtitle={zeroCashbackInfoT}
                  multiline>
                    {zeroCashbackT}
                  </Cell>
               }


                </>
           
           }
           
           </Section>
           )}


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