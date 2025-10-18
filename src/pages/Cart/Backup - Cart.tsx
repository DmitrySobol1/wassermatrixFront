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
// import React from 'react';
import axios from '../../axios';

import { useNavigate } from 'react-router-dom';

import { useEffect, useState,useContext } from 'react';
// import { useContext, useEffect, useState, useRef } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';

// import { useLocation } from 'react-router-dom';

import { settingsButton } from '@telegram-apps/sdk-react';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
// import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
// import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';

// import styles from './walletpage.module.css';
import { TEXTS } from './texts.ts';

// import payin from '../../img/payin.png';
// import payout from '../../img/payout.png';
// import changebetweenusers from '../../img/changebetweenusers.png';

export const Cart: FC = () => {
  //FIXME:
  const tlgid = useTlgid();
  // const tlgid = 412697670;
  // const tlgid = 777;

  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);

  const navigate = useNavigate();

  
  const [cart, setCart] = useState([]);
  const [totalInfo, setTotalInfo] = useState({});
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSpin,setShowSpin] = useState(false)
  const [noCart, setNoCart] = useState(false)
  const [valuteToShowOnFront,setValuteToShowOnFront] = useState('')

  // const [cart,setCart] = useState([])

  const domen = import.meta.env.VITE_DOMEN;

  //@ts-ignore
  const {plusT,minusT,deleteT,totalT,pcsT,addedT,nextBtn,itemAdded, emptyCartT, toCatalogT} = TEXTS[language];
   
 
  if (settingsButton.mount.isAvailable()) {
      settingsButton.mount();
      settingsButton.isMounted(); // true
      settingsButton.show();
    }
  
    if (settingsButton.onClick.isAvailable()) {
      function listener() {
        console.log('Clicked!');
        navigate('/setting-button-menu');
      }
      settingsButton.onClick(listener);
    }

 

  // получить корзину
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const cart = await axios.get('/user_get_mycart', {
          params: {
            tlgid,
          },
        });
        console.log('cart', cart);

        if (cart.data.goods.length == 0) {
            setNoCart(true)
            
        } 

        setCart(cart.data.goods);
        setValuteToShowOnFront(cart.data.valuteToShow)
        setTotalInfo(cart.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchGoodsTypesInfo();
  }, []);

  

  //@ts-ignore
  async function cartButtonsHandler(goodId, action) {
    setShowSpin(true)
    try {
      const response = await axios.post('/user_add_good_tocart', {
        userid: tlgid,
        action: action,
        goodsarray: [
          {
            itemId: goodId,
            qty: 1,
          },
        ],
      });

      const cart = await axios.get('/user_get_mycart', {
        params: {
          tlgid,
        },
      });
      console.log('cart', cart);
      

      setCart(cart.data.goods);
      setTotalInfo(cart.data)
      setShowSpin(false)
      console.log(response.data);
      // setOpenSnakbar(true);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }
  }

  return (
    <Page back={false}>

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

      
          { noCart && 
       <>
       <Section>
       <Cell>{emptyCartT}</Cell>
       <Section style={{ marginBottom: 100, padding: 10 }}
        onClick={() => navigate('/catalog-page')}

      >
          <Button stretched>{toCatalogT}</Button>
        </Section> 
        </Section>
        <TabbarMenu />
       </>
      }

      {!isLoading && !noCart &&  <>




      <List>
        

        {cart.map((item:any) => (
          <>
            <Section >
              
              <Cell
              //@ts-ignore
                subtitle={`${addedT} ${item.qty} ${pcsT}`}
                //@ts-ignore
                before={<Image size={96} src={`${domen}${item.img}`} />}
                style={{ paddingTop: 15 }}
                //@ts-ignore
                after={`${item.totalpriceItem}${item.valuteToShow}`}
                description={`1 ${pcsT} x ${item.priceToShow} ${item.valuteToShow}`}
                multiline
              >
                
                 
                {item[`name_${language}`]}
              </Cell>
              {/* <ButtonCell before={<Icon28AddCircle />}> */}

              <ButtonCell
                before={
                  <Image size={24}>
                      {<AddCircleOutlineIcon/>}
                  </Image>
                }
                //@ts-ignore
                onClick={() => cartButtonsHandler(item.itemId, 'plus')}
              >
                {!showSpin && <Text weight="2">{plusT}</Text>}
                {showSpin && <Spinner size="s" />}
              </ButtonCell>
              <ButtonCell
                before={
                  
                   <Image size={24}>
                      {<RemoveCircleOutlineIcon/>}
                    </Image>
                }
                //@ts-ignore
                onClick={() => cartButtonsHandler(item.itemId, 'minus')}
              >
                {!showSpin &&<Text weight="2">{minusT}</Text>}
                {showSpin && <Spinner size="s" />}
              </ButtonCell>
              <ButtonCell
                before={
                  
                    <Image size={24}>
                      {<DeleteOutlineIcon/>}
                    </Image>
                 
                 
                }
                //@ts-ignore
                onClick={() => cartButtonsHandler(item.itemId, 'delete')}
              >
               {!showSpin && <Text weight="2">{deleteT}</Text>}
                {showSpin && <Spinner size="s" />}
              </ButtonCell>
            </Section>
          </>
        ))}

        <Section >
           <Cell
            //@ts-ignore
                subtitle={`${totalInfo.totalQty} ${pcsT}`}
                style={{ paddingTop: 15 }}
                 //@ts-ignore
                after=<Text weight='2'>{`${totalInfo.totalPriceCart} ${valuteToShowOnFront}`}</Text>
              >
                {' '}
                <Text weight='2'>{totalT}</Text>
              </Cell>
        </Section>

        
      <Section style={{ marginBottom: 100, padding: 10 }}
      

        onClick={() => navigate('/delivery-choice-page', {
            state: {
                cart: cart
            }
        })}

      >
          <Button stretched>{nextBtn}</Button>
        </Section>
      </List>


      {openSnakbar && (
        <Snackbar duration={1500} onClose={() => setOpenSnakbar(false)}>
          {itemAdded}
        </Snackbar>
      )}

      <TabbarMenu />
      </>}
    </Page>
  );
};
