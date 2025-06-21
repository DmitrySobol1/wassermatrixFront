import {
  Cell,
  List,
  Button,
  Badge,
  ButtonCell,
  Snackbar,
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

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import { Icon28Close } from '@telegram-apps/telegram-ui/dist/icons/28/close';
// import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';
import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';

import styles from './catalog.module.css';
// import { TEXTS } from './texts.ts';

// import payin from '../../img/payin.png';
// import payout from '../../img/payout.png';
// import changebetweenusers from '../../img/changebetweenusers.png';

export const OneGood: FC = () => {
  //FIXME:
  // const tlgid = useTlgid();
  const tlgid = 412697670;

  const { language } = useContext(LanguageContext);

  //    const navigate = useNavigate();
  const location = useLocation();
  const { itemid } = location.state || {};

  const [goodInfo, setGoodInfo] = useState({});
  const [openSnakbar, setOpenSnakbar] = useState(false);

  const domen = import.meta.env.VITE_DOMEN;

  // получить товар по id
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const good = await axios.get('/user_get_currentgood', {
          //   @ts-ignore
          params: {
            id: itemid,
          },
        });

        // interface IGoodRender {
        //   name: String;
        //   description_short: String;
        //   description_long: String;
        // }

        const goodToRender = {
          name: good.data[`name_${language}`],
          description_short: good.data[`description_short_${language}`],
          description_long: good.data[`description_long_${language}`],
          img: `${domen}${good.data.file.url}`,
          id: good.data._id,
          type: good.data.type,
          price: good.data.price_eu,
        };

        console.log('goodToRender=', goodToRender);

        //   @ts-ignore
        setGoodInfo(goodToRender);

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
    <Page back={true}>
      <List>
        <img src={goodInfo.img} className={styles.img} />

        <Cell subtitle={goodInfo.description_short} after={goodInfo.price}>
          {goodInfo.name}
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

        
          <Button
            before={<Icon28AddCircle />}
            mode="filled"
            size="m"
            onClick={() => addToCartHandler(goodInfo.id)}
            stretched
            style={{width:'90%',alignItems:'center', marginLeft:24}}
          >
            Добавить в корзину
          </Button>
        

        <Cell multiline>{goodInfo.description_long}</Cell>
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
