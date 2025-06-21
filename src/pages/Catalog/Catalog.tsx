import {
  Section,
  Cell,
  List,
  Card,
  Button,
  Chip,
  Radio,
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

// import { settingsButton } from '@telegram-apps/sdk-react';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';

// import styles from './catalog.module.css';
// import { TEXTS } from './texts.ts';

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

  const domen = import.meta.env.VITE_DOMEN;

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


  // function addBtnHandler(e: any) {
  //   console.log('add btn Pressed', e.target);
  // }

  //   function typePressedHandler(typeId: string) {
  //   console.log('You choose type:', typeId);
  // }

  //FIXME: приходит 2 раза - один раз норм, другой undefined
  function typePressedHandler(typeId: string) {
    console.log('you choose type=', typeId);

    //@ts-ignore
    if (typeId == '1') {
      setArrayGoodsForRender(allGoods);
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
  }

  // function addToCartHandler(goodId){
  //   console.log('added',goodId)
  //   //cart
  //   // id , qty, name, price
  //   const goodToAdd = {
  //     id: goodId,
  //     qty: 1,
  //     name: 'testName',
  //     price : 100
  //   }

  //   console.log('goodToAdd',goodToAdd)

  //   const newArray = [...cart,{goodToAdd}]

  //   setCart(newArray);
  //   console.log('newArray',newArray)

  // }

  //@ts-ignore
  async function addToCartHandler(goodId) {
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

  return (
    <Page back={false}>
      <List>
        <Section>
          
          <List
            style={{
              // background: 'var(--tgui--secondary_bg_color)',
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              {arrayTypesForRender.map((type: any) => (
                <>
                  <Chip
                    key={type.id}
                    // onClick={(e) => typePressedHandler(e)}
                    onClick={() => typePressedHandler(type.id)}
                    mode="elevated"
                    Component="label"
                    before={<Radio name="radio" value={type.id} />}
                    // defaultChecked
                  >
                    {type.name}
                  </Chip>
                </>
              ))}
            </div>
          </List>

              {/* <div className={styles.filterContainer}>
  <button className={styles.filterbtn}>Фильтр 1</button>
  <button className={styles.filterbtn}>Фильтр 2</button>
  <button className={styles.filterbtn}>Фильтр 3</button>
  <button className={styles.filterbtn}>Фильтр 4</button>
  <button className={styles.filterbtn}>Фильтр 5</button>
  
</div> */}



          {arrayGoodsForRender.map((item: any) => (
            <>
              <Cell>
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

                    <Cell>
                      <Button
                        before={<Icon28AddCircle />}
                        stretched
                        mode="filled"
                        size="m"
                        onClick={() => addToCartHandler(item.id)}
                        style={{paddingLeft:30,paddingRight:30}}
                      >
                        Добавить в корзину
                      </Button>
                    </Cell>
                    
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
              </Cell>
            </>
          ))}
        </Section>

        <Cell></Cell>
      </List>

      {openSnakbar && (
        <Snackbar duration={1500} onClose={() => setOpenSnakbar(false)}>
          Товар добавлен
        </Snackbar>
      )}

      <TabbarMenu />
    </Page>
  );
};
