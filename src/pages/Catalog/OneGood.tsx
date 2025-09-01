import {
  Cell,
  List,
  Button,
  Snackbar,
  Section,
  Spinner,
  Chip,
  Subheadline,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
// import React from 'react';
import axios from '../../axios';

// import { useNavigate } from 'react-router-dom';

import { useContext, useEffect, useState } from 'react';
// import { useContext, useEffect, useState, useRef } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';

// import { useLocation } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// import { useLocation, useNavigate } from 'react-router-dom';

// import { settingsButton } from '@telegram-apps/sdk-react';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
// import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import styles from './catalog.module.css';
import { TEXTS } from './texts.ts';

// import payin from '../../img/payin.png';
// import payout from '../../img/payout.png';
// import changebetweenusers from '../../img/changebetweenusers.png';

export const OneGood: FC = () => {
  //FIXME:
  const tlgid = useTlgid();
  // const tlgid = 412697670;

  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);

  //    const navigate = useNavigate();
  const location = useLocation();
  const { itemid } = location.state || {};

  // const [goodInfo, setGoodInfo] = useState({});
  const [goodInfo, setGoodInfo] = useState<GoodInfo | null>(null);
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [spinBtn, setSpinBtn] = useState(false);
  const [viewersCount] = useState(() => Math.floor(Math.random() * 11) + 5);

  const domen = import.meta.env.VITE_DOMEN;

  //@ts-ignore
  const { addToCartT, itemAdded, goodWatchT, peopleT} = TEXTS[language];

  interface GoodInfo {
    img: string;
    name: string;
    description_short: string;
    description_long: string;
    price: string;
    id: string;
    valuteToShow: string;
    basePrice: string;
    isSaleNow: boolean;
    infoForFront?: string
  }

  // получить товар по id
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const good = await axios.get('/user_get_currentgood', {
          //   @ts-ignore
          params: {
            id: itemid,
            tlgid: tlgid,
          },
        });

        console.log('GOOD', good);

        const goodToRender = {
          name: good.data[`name_${language}`],
          description_short: good.data[`description_short_${language}`],
          description_long: good.data[`description_long_${language}`],
          img: `${domen}${good.data.file.url}`,
          id: good.data._id,
          type: good.data.type,
          price: good.data.priceToShow,
          valuteToShow: good.data.valuteToShow,
          isSaleNow: good.data.isSaleNow,
          basePrice: good.data.basePriceToShowClientValute,
          infoForFront: good.data?.saleInfo?.[`infoForFront_${language}`]
        };

        console.log('goodToRender=', goodToRender);

        //   @ts-ignore
        setGoodInfo(goodToRender);
        setIsLoading(false);

        console.log('goodToRender', goodToRender);
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
  async function addToCartHandler(goodId) {
    setSpinBtn(true);
    try {
      const response = await axios.post('/user_add_good_tocart', {
        userid: tlgid,
        action: 'plus',
        goodsarray: [
          {
            itemId: goodId,
            qty: 1,
          },
        ],
      });

      console.log(response.data);
      setOpenSnakbar(true);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }
  }

  function snakHandler() {
    setOpenSnakbar(false);
    setSpinBtn(false);
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
            <Section style={{ marginBottom: 100 }}>
              <img src={goodInfo?.img || ''} className={styles.img} />

              { !goodInfo?.isSaleNow &&
              <div style={{ marginLeft: 20 }}>
                  <Subheadline
                    level="1"
                    weight="3"
                    className={styles.nowWatchText}
                  >
                    <RemoveRedEyeIcon sx={{ fontSize: 16, marginRight: '4px' }}/> {goodWatchT} {viewersCount} {peopleT}
                  </Subheadline>
                  </div>
              }


            { goodInfo?.isSaleNow &&     
              <div className={styles.nowWatchWrapper} >
                <Chip 
                mode='elevated' 
                style={{backgroundColor:'#ed6c02', padding: '5px 20px', marginLeft:20}}>
                  <span style={{color:'white'}}>{goodInfo?.infoForFront}</span>
                </Chip>
                <div>
                  
                  <Subheadline
                    level="1"
                    weight="3"
                    className={styles.nowWatchText}
                  >
                    <RemoveRedEyeIcon sx={{ fontSize: 16, marginRight: '4px' }}/> {goodWatchT} {viewersCount} {peopleT}
                  </Subheadline>
                  </div>
              </div>
            }  

              <Cell
                subtitle={goodInfo?.description_short}
                // after={`${goodInfo?.price}${goodInfo?.valuteToShow}`}
                multiline
              >
               
               <span style={{marginRight:10}}> {goodInfo?.name}</span> { goodInfo?.isSaleNow ? (<><span style={{ textDecoration: 'line-through', marginRight:10 }}>{goodInfo?.basePrice} {goodInfo?.valuteToShow}</span><span style={{fontWeight:'bold'}}> {goodInfo?.price} {goodInfo?.valuteToShow}</span> </>)  : `${goodInfo?.price} ${goodInfo?.valuteToShow}` }
              </Cell>

              {/* <Cell>
          <Button
            before={<Icon28AddCircle />}
            mode="filled"
            size="m"
            onClick={() => addToCartHandler(goodInfo.id)}
            stretched
          >
            Добавить в корзину
          </Button>
        </Cell> */}

              <div className={styles.divAddBtn2}>
                <Button
                  before={<Icon28AddCircle />}
                  mode="filled"
                  size="m"
                  loading={spinBtn}
                  onClick={() => addToCartHandler(goodInfo?.id)}
                  stretched
                  // style={{width:'90%',alignItems:'center', marginLeft:24}}
                  // style={{width:'90%',alignItems:'center', marginLeft:24}}
                >
                  {addToCartT}
                </Button>
              </div>

              <Cell multiline>{goodInfo?.description_long}</Cell>
            </Section>
          </List>

          {openSnakbar && (
            <Snackbar duration={1200} onClose={snakHandler}>
              {itemAdded}
            </Snackbar>
          )}

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
