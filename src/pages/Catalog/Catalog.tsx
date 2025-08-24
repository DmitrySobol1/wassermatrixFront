import {
  Section,
  Cell,
  List,
  Card,
  Button,
  Spinner,
  Snackbar,
  Accordion,
  Checkbox,
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
import { BannersSwiper } from '../../components/BannersSwiper/BannersSwiper.tsx';

import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';

import styles from './catalog.module.css';
import { TEXTS } from './texts.ts';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';
import { CardChip } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';

// import payin from '../../img/payin.png';
// import payout from '../../img/payout.png';
// import changebetweenusers from '../../img/changebetweenusers.png';

export const CatalogPage: FC = () => {
  //FIXME:
  const tlgid = useTlgid();
  // const tlgid = 412697670;
  // const tlgid = 777;

  const { language } = useContext(LanguageContext);
  
  
  const firstSortArray = {
    name_de: 'beliebtheit (aufs)',
    name_en: 'popularity (asc)',
    name_ru: 'популярности (возр)',
  }

  //@ts-ignore
  const firstSort = firstSortArray[`name_${language}`]

  const navigate = useNavigate();

  const [arrayTypesForRender, setArrayTypesForRender] = useState([]);
  const [allGoods, setAllGoods] = useState([]);
  const [arrayGoodsForRender, setArrayGoodsForRender] = useState([]);
  // const [cart, setCart] = useState([]);
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [activeTypeId, setActiveTypeId] = useState<number | null>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [spinBtn, setSpinBtn] = useState(false);
  const [salesInfo, setSalesInfo] = useState<any[]>([]);
  const [isShowBanner, setIsShowBanner] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [sortType, setSortType] = useState(firstSort);
  const [sortVariant, setSortVariant] = useState([
    {
      id: 1,
      name_de: 'beliebtheit (aufs)',
      name_en: 'popularity (asc)',
      name_ru: 'популярности (возр)',
      isChoosed: true,
      sortKey: 'popularity_asc',
    },
    {
      id: 2,
      name_de: 'beliebtheit (abst)',
      name_en: 'popularity (desc)',
      name_ru: 'популярности (убыв)',
      isChoosed: false,
      sortKey: 'popularity_desc',
    },
    { id: 3, 
      name_de: 'preis (aufs)', 
      name_en: 'price (asc)', 
      name_ru: 'цене (возр)', 
      isChoosed: false, 
      sortKey: 'price_asc' },
    { id: 4, 
      name_de: 'preis (abst)', 
      name_en: 'price (desc)', 
      name_ru: 'цене (убыв)', 
      isChoosed: false, 
      sortKey: 'price_desc' },
  ]);

  const domen = import.meta.env.VITE_DOMEN;

  //@ts-ignore
  const { addToCartT, itemAdded, sortByT, saleCardT } = TEXTS[language];

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

  // Функция сортировки товаров
  const sortGoods = (goods: any[], sortType: string) => {
    const sortedGoods = [...goods];

    switch (sortType) {
      case 'popularity_asc':
        return sortedGoods.sort(
          (a, b) => (a.quantityOfPurchases || 0) - (b.quantityOfPurchases || 0)
        );
      case 'popularity_desc':
        return sortedGoods.sort(
          (a, b) => (b.quantityOfPurchases || 0) - (a.quantityOfPurchases || 0)
        );
      case 'price_asc':
        return sortedGoods.sort(
          (a, b) => (a.price || 0) - (b.price || 0)
        );
      case 'price_desc':
        return sortedGoods.sort(
          (a, b) => (b.price || 0) - (a.price || 0)
        );
      default:
        return sortedGoods;
    }
  };

  // получить список типов товаров + товары
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const types = await axios.get('/user_get_goodsstype');
        const goods = await axios.get('/user_get_goods', {
          params: { tlgid: tlgid },
        });

        console.log('GOODS', goods);

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
          price: item.priceToShow,
          basePrice: item.basePriceToShowClientValute,
          isSaleNow: item.isSaleNow,
          valuteToShow: item.valuteToShow,
          chipInfo: item.saleInfo ? item.saleInfo[`infoForFront_${language}`] : '',
          quantityOfPurchases: item.quantityOfPurchases || 0,
          price_eu: item.price_eu || 0,
          
        }));

        setAllGoods(arrayGoodsForRender);
        setArrayGoodsForRender(arrayGoodsForRender);
        setIsLoading(false);

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

  // получить данные об акциях
  useEffect(() => {
    const fetchSalesInfo = async () => {
      try {
        const response = await axios.get('/admin_get_sales');

        console.log('SALES INFO', response.data);

        if (response.data && response.data.length > 0) {
          setSalesInfo(response.data);
          setIsShowBanner(true);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных об акциях:', error);
      }
    };

    fetchSalesInfo();
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
    let filteredGoods = [];
    if (typeId == '1') {
      filteredGoods = allGoods;
    } else {
      filteredGoods = allGoods.filter((item: any) => item.type === typeId);
    }

    // Получаем текущий ключ сортировки из выбранного варианта
    const selectedVariant = sortVariant.find((item) => item.isChoosed);
    const currentSortKey = selectedVariant
      ? selectedVariant.sortKey
      : 'popularity_asc';

    // Применяем сортировку к отфильтрованным товарам
    const sortedGoods = sortGoods(filteredGoods, currentSortKey);
    //@ts-ignore
    setArrayGoodsForRender(sortedGoods);
    //@ts-ignore
    setActiveTypeId(typeId);
  }

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
      // setSpinBtn(false)
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

  const handleAccordionChange = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Функция для обработки выбора варианта сортировки
  const handleSortVariantSelect = (selectedId: number) => {
    setIsSorting(true);

    // Обновляем состояние вариантов сортировки
    const updatedVariants = sortVariant.map((item) => ({
      ...item,
      isChoosed: item.id === selectedId,
    }));
    setSortVariant(updatedVariants);

    // Находим выбранный вариант и обновляем текущий тип сортировки
    const selectedVariant = sortVariant.find((item) => item.id === selectedId);
    if (selectedVariant) {
      //@ts-ignore
      setSortType(selectedVariant[`name_${language}`]);

      // Применяем сортировку
      applySortToGoods(selectedVariant.sortKey);
    }

    // Закрываем accordion
    setExpandedOrderId(null);

    // Скрываем лоадер через короткое время
    setTimeout(() => {
      setIsSorting(false);
    }, 300);
  };

  // Функция применения сортировки к товарам
  const applySortToGoods = (sortKey: string) => {
    //@ts-ignore
    let filteredGoods = [];
    if (activeTypeId == 1) {
      filteredGoods = allGoods;
    } else {
      filteredGoods = allGoods.filter(
        (item: any) => item.type === activeTypeId
      );
    }

    const sortedGoods = sortGoods(filteredGoods, sortKey);
    //@ts-ignore
    setArrayGoodsForRender(sortedGoods);
  };

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

      {!isLoading && (
        <>
          <List>
            <Section style={{ marginBottom: 100 }}>
              {isShowBanner && salesInfo.length > 0 && (
                <BannersSwiper
                  sales={salesInfo}
                  language={language}
                  domen={domen}
                />
              )}

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

              <Accordion
                expanded={expandedOrderId === '1'}
                onChange={() => handleAccordionChange('1')}
              >
                <AccordionSummary>
                  {sortByT} {' '}
                  <span
                    style={{
                      color: '#40a7e3',
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                    }}
                  >
                    {sortType}
                  </span>
                  {isSorting && (
                    <span style={{ marginLeft: 8 }}>
                      <Spinner size="s" />
                    </span>
                  )}
                </AccordionSummary>
                <AccordionContent>
                  {sortVariant.map((item) => (
                    <Cell
                      key={item.id}
                      onClick={() => handleSortVariantSelect(item.id)}
                      style={{ cursor: 'pointer' }}
                    > <div style = {{display: 'flex', alignItems: 'center', justifyContent:'center'}}>
                      <Checkbox checked={item.isChoosed} readOnly />

                      
                      <span style={{ marginLeft: 8 }}>{(item as any)[`name_${language}`]}</span>
                    </div>
                    </Cell>
                  ))}
                </AccordionContent>
              </Accordion>

              {arrayGoodsForRender.map((item: any) => (
                <>
                  <div className={styles.divCard}>
                    <Card type="plain" style={{ width: '90%' }}>
                      <React.Fragment key=".0">
                        {item.isSaleNow &&
                          <CardChip readOnly style={{ backgroundColor: '#ed6c02' }}>
                            {/* <span style={{ color: '#ffffff' }}>{saleCardT}</span> */}
                            <span style={{ color: '#ffffff' }}>{item.chipInfo}</span>
                          </CardChip>
                        }
                        <img
                          alt="image"
                          id={item.id}
                          src={item.img}
                          style={{
                            display: 'block',
                            height: 300,
                            objectFit: 'cover',
                            width: '100%',
                          }}
                          onClick={(e) => cardPressedHandler(e)}
                        />

                        <Cell
                          readOnly
                          multiline
                          subtitle={item.description_short}
                        >
                          {item.name}
                        </Cell>
                        <Cell>
                        { item.isSaleNow ? (<><span style={{ textDecoration: 'line-through', marginRight:10 }}>{item.basePrice} {item.valuteToShow}</span><span style={{fontWeight:'bold'}}> {item.price} {item.valuteToShow}</span> </>)  : `${item.price} ${item.valuteToShow}` }
                        </Cell>

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
              {itemAdded}
            </Snackbar>
          )}
        </>
      )}
    </Page>
  );
};
