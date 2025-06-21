import {
  Section,
  Cell,
  List,
  Card,
  Button,
  Spinner,
  Snackbar,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import React from 'react';
import axios from '../../axios';

import { useNavigate } from 'react-router-dom';

import { useContext, useEffect, useState } from 'react';
// import { useContext, useEffect, useState, useRef } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';

// import { useLocation } from 'react-router-dom';

import { settingsButton } from '@telegram-apps/sdk-react';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';

import styles from './catalog.module.css';
import { TEXTS } from './texts.ts';

// import payin from '../../img/payin.png';
// import payout from '../../img/payout.png';
// import changebetweenusers from '../../img/changebetweenusers.png';

export const CatalogPage: FC = () => {
  //FIXME:
  // const tlgid = useTlgid();
  const tlgid = 412697670;

  const { language } = useContext(LanguageContext);

  const navigate = useNavigate();

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
  const [allGoods, setAllGoods] = useState([]);
  const [arrayGoodsForRender, setArrayGoodsForRender] = useState([]);
  // const [cart, setCart] = useState([]);
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [activeTypeId, setActiveTypeId] = useState<number | null>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [spinBtn,setSpinBtn] = useState(false)

  const domen = import.meta.env.VITE_DOMEN;

  //@ts-ignore
  const {addToCartT} = TEXTS[language];


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

  // получить список типов товаров + товары
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const types = await axios.get('/user_get_goodsstype');
        const goods = await axios.get('/user_get_goods');

        //@ts-ignore
        const arrayTemp = types.data.map((item) => ({
          name: item[`name_${language}`],
          id: item._id,
        }));

        const allElement = {
          ru: 'Все',
          en: 'All',
          de: 'Alle',
        };

        //@ts-ignore
        const arrayTypesForRender = [
          //@ts-ignore
          { name: allElement[language], id: 1 },
          ...arrayTemp,
        ];
        //@ts-ignore
        setArrayTypesForRender(arrayTypesForRender);

        //@ts-ignore
        const arrayGoodsForRender = goods.data.map((item) => ({
          name: item[`name_${language}`],
          description_short: item[`description_short_${language}`],
          img: `${domen}${item.file.url}`,
          // img: item.img,
          id: item._id,
          type: item.type,
          price: item.price_eu,
        }));

        setAllGoods(arrayGoodsForRender);
        setArrayGoodsForRender(arrayGoodsForRender);
        setIsLoading(false)

        console.log('formattedTypes', arrayTypesForRender);
        console.log('formattedGoods', arrayGoodsForRender);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchGoodsTypesInfo();
  }, []);

  function cardPressedHandler(e: any) {
    console.log('card Pressed', e.target.id);
    navigate('/onegood-page', {
      state: {
        itemid: e.target.id,
      },
    });
  }

 

  //FIXME: приходит 2 раза - один раз норм, другой undefined
  function typePressedHandler(typeId: string) {
    console.log('you choose type=', typeId);

    //@ts-ignore
    if (typeId == '1') {
      setArrayGoodsForRender(allGoods);
      setActiveTypeId(1);
      return;
    }

    //@ts-ignore
    let newArray = [];

    allGoods.map((item) => {
      //@ts-ignore
      if (item.type === typeId) {
        console.log('внутри');

        //@ts-ignore
        newArray = [item, ...newArray];
      }
    });
    //@ts-ignore
    setArrayGoodsForRender(newArray);
    //@ts-ignore
    setActiveTypeId(typeId);
  }

 

  //@ts-ignore
  async function addToCartHandler(goodId) {
    setSpinBtn(true)
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
      // setSpinBtn(false)
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      // setShowLoader(false);
      // setWolfButtonActive(true);
    }
  }

  function snakHandler(){
    setOpenSnakbar(false)
    setSpinBtn(false)

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


          {!isLoading && (<>


      <List>
       
       
        <Section style={{ marginBottom: 100 }}>

             <div className={styles.filterContainer}>
            {arrayTypesForRender.map((type: any) => (
              <div
                key={type.id} // Добавляем key для React
                className={`${styles.filterItem} ${
                  activeTypeId === type.id ? styles.active : ''
                }`}
                onClick={() => typePressedHandler(type.id)}
              >
                {type.name}
              </div>
            ))}
          </div>


          {arrayGoodsForRender.map((item: any) => (
            <>
              <div className={styles.divCard}>
                <Card type="plain">
                  <React.Fragment key=".0">
                    <img
                      alt="image"
                      id={item.id}
                      src={item.img}
                      style={{
                        display: 'block',
                        height: 200,
                        objectFit: 'cover',
                        width: 300,
                      }}
                      onClick={(e) => cardPressedHandler(e)}
                    />

                    <Cell readOnly subtitle={item.description_short}>
                      {item.name}
                    </Cell>
                    <Cell>{item.price} euro</Cell>

                    <div className={styles.divAddBtn}>
                      <Button
                        loading={spinBtn}
                        before={<Icon28AddCircle />}
                        stretched
                        mode="filled"
                        size="m"
                        onClick={() => addToCartHandler(item.id)}
                        style={{ paddingLeft: 30, paddingRight: 30 }}
                      >
                        {addToCartT}
                      </Button>
                    </div>

                    {/* <div style={{display:'flex',width:'80%' ,justifyContent:'center', marginLeft:10}}>
                    <Button
                      before={<Icon28AddCircle />}
                      // stretched
                      mode="filled"
                      size="l"
                      // style = {{width:'70%'}}
                      onClick={() => addToCartHandler(item.id)}
                    >
                      Добавить в корзину
                    </Button>
                    </div> */}
                  </React.Fragment>
                </Card>
              </div>
            </>
          ))}
        </Section>

        {/* <Cell></Cell> */}
      </List>

      <TabbarMenu />

      {openSnakbar && (
        <Snackbar duration={1200} onClose={snakHandler}>
          Товар добавлен
        </Snackbar>
      )}
      </>)}
    </Page>
  );
};
