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
import React, { memo } from 'react';
import axios from '../../axios';

import { useNavigate } from 'react-router-dom';

import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { BannersSwiper } from '../../components/BannersSwiper/BannersSwiper.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import styles from './catalog.module.css';
import { TEXTS } from './texts.ts';
import { useSettingsButton } from '@/hooks/useSettingsButton';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';
import { CardChip } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';

// ============= ТИПЫ =============

type LanguageKey = 'ru' | 'en' | 'de';

interface SortVariantItem {
  id: number;
  name_de: string;
  name_en: string;
  name_ru: string;
  isChoosed: boolean;
  sortKey: 'popularity_asc' | 'popularity_desc' | 'price_asc' | 'price_desc';
}

// ============= КОНСТАНТЫ ВНЕ КОМПОНЕНТА =============

// Варианты сортировки
const SORT_OPTIONS: SortVariantItem[] = [
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
  {
    id: 3,
    name_de: 'preis (aufs)',
    name_en: 'price (asc)',
    name_ru: 'цене (возр)',
    isChoosed: false,
    sortKey: 'price_asc',
  },
  {
    id: 4,
    name_de: 'preis (abst)',
    name_en: 'price (desc)',
    name_ru: 'цене (убыв)',
    isChoosed: false,
    sortKey: 'price_desc',
  },
];

const FIRST_SORT_NAMES = {
  name_de: 'beliebtheit (aufs)',
  name_en: 'popularity (asc)',
  name_ru: 'популярности (возр)',
};

// Стили
const SPINNER_CONTAINER_STYLE: React.CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
  padding: '100px',
};

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 100,
};

const SORT_TYPE_STYLE: React.CSSProperties = {
  color: '#40a7e3',
  textDecoration: 'underline',
  textDecorationStyle: 'dotted',
};

const SPINNER_MARGIN_STYLE: React.CSSProperties = {
  marginLeft: 8,
};

const CHECKBOX_CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const CARD_STYLE: React.CSSProperties = {
  width: '90%',
};

const CHIP_STYLE: React.CSSProperties = {
  backgroundColor: '#ed6c02',
};

const CHIP_TEXT_STYLE: React.CSSProperties = {
  color: '#ffffff',
};

const IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  height: 300,
  objectFit: 'cover',
  width: '100%',
};

const BUTTON_STYLE: React.CSSProperties = {
  paddingLeft: 30,
  paddingRight: 30,
};

const PRICE_STRIKETHROUGH_STYLE: React.CSSProperties = {
  textDecoration: 'line-through',
  marginRight: 10,
};

const PRICE_BOLD_STYLE: React.CSSProperties = {
  fontWeight: 'bold',
};

const CELL_CURSOR_STYLE: React.CSSProperties = {
  cursor: 'pointer',
};

const ERROR_MESSAGE_STYLE: React.CSSProperties = {
  color: 'red',
  marginBottom: '10px',
};

// ============= ДОПОЛНИТЕЛЬНЫЕ ТИПЫ =============

interface TypeItem {
  id: string | number;
  name: string;
}

interface SaleInfo {
  infoForFront_ru: string;
  infoForFront_en: string;
  infoForFront_de: string;
}

interface ApiGoodItem {
  _id: string;
  name_ru: string;
  name_en: string;
  name_de: string;
  description_short_ru: string;
  description_short_en: string;
  description_short_de: string;
  file: { url: string };
  type: string;
  priceToShow: number;
  basePriceToShowClientValute: number;
  isSaleNow: boolean;
  valuteToShow: string;
  saleInfo?: SaleInfo;
  quantityOfPurchases?: number;
  price_eu?: number;
}

interface ApiGoodsTypeItem {
  _id: string;
  name_ru: string;
  name_en: string;
  name_de: string;
}

interface GoodItemType {
  id: string;
  name: string;
  description_short: string;
  img: string;
  isSaleNow: boolean;
  chipInfo: string;
  basePrice: number;
  price: number;
  valuteToShow: string;
  type: string;
  quantityOfPurchases: number;
  price_eu: number;
}

interface GoodCardProps {
  item: GoodItemType;
  onCardClick: (e: any) => void;
  onAddToCart: (id: string) => void;
  spinBtn: boolean;
  addToCartT: string;
}

interface TypeFilterProps {
  types: Array<{ id: string | number; name: string }>;
  activeTypeId: string | number | null;
  onTypeSelect: (id: string) => void;
}

interface SortAccordionProps {
  expanded: boolean;
  sortType: string;
  isSorting: boolean;
  sortVariant: SortVariantItem[];
  language: string;
  sortByT: string;
  onAccordionChange: () => void;
  onSortSelect: (id: number) => void;
}

// ============= ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ =============

// Мемоизированный компонент карточки товара
const GoodCard = memo<GoodCardProps>(
  ({ item, onCardClick, onAddToCart, spinBtn, addToCartT }) => {
    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(item.id);
      },
      [item.id, onAddToCart]
    );

    return (
      <div className={styles.divCard}>
        <Card
          type="plain"
          style={CARD_STYLE}
          id={item.id}
          onClick={onCardClick}
        >
          <React.Fragment key=".0">
            {item.isSaleNow && (
              <CardChip readOnly style={CHIP_STYLE}>
                <span style={CHIP_TEXT_STYLE}>{item.chipInfo}</span>
              </CardChip>
            )}

            <img
              alt="image"
              id={item.id}
              src={item.img}
              loading="lazy"
              style={IMAGE_STYLE}
              onClick={onCardClick}
            />

            <Cell
              readOnly
              multiline
              subtitle={item.description_short}
              id={item.id}
            >
              {item.name}
            </Cell>
            <Cell>
              {item.isSaleNow ? (
                <>
                  <span style={PRICE_STRIKETHROUGH_STYLE}>
                    {item.basePrice} {item.valuteToShow}
                  </span>
                  <span style={PRICE_BOLD_STYLE}>
                    {item.price} {item.valuteToShow}
                  </span>
                </>
              ) : (
                `${item.price} ${item.valuteToShow}`
              )}
            </Cell>

            <div className={styles.divAddBtn}>
              <Button
                loading={spinBtn}
                before={<Icon28AddCircle />}
                stretched
                mode="filled"
                size="m"
                onClick={handleAddToCart}
                style={BUTTON_STYLE}
              >
                {addToCartT}
              </Button>
            </div>
          </React.Fragment>
        </Card>
      </div>
    );
  }
);

GoodCard.displayName = 'GoodCard';

// Мемоизированный компонент фильтра типов
const TypeFilter = memo<TypeFilterProps>(
  ({ types, activeTypeId, onTypeSelect }) => {
    return (
      <div className={styles.filterContainer}>
        {types.map((type: TypeItem) => (
          <div
            key={type.id}
            className={`${styles.filterItem} ${
              String(activeTypeId) === String(type.id) ? styles.active : ''
            }`}
            onClick={() => onTypeSelect(String(type.id))}
          >
            {type.name}
          </div>
        ))}
      </div>
    );
  }
);

TypeFilter.displayName = 'TypeFilter';

// Мемоизированный компонент аккордеона сортировки
const SortAccordion = memo<SortAccordionProps>(
  ({
    expanded,
    sortType,
    isSorting,
    sortVariant,
    language,
    sortByT,
    onAccordionChange,
    onSortSelect,
  }) => {
    return (
      <Accordion expanded={expanded} onChange={onAccordionChange}>
        <AccordionSummary>
          {sortByT} <span style={SORT_TYPE_STYLE}>{sortType}</span>
          {isSorting && (
            <span style={SPINNER_MARGIN_STYLE}>
              <Spinner size="s" />
            </span>
          )}
        </AccordionSummary>
        <AccordionContent>
          {sortVariant.map((item) => {
            const localizedName = item[`name_${language}` as keyof Pick<SortVariantItem, 'name_ru' | 'name_en' | 'name_de'>];
            return (
              <Cell
                key={item.id}
                onClick={() => onSortSelect(item.id)}
                style={CELL_CURSOR_STYLE}
              >
                <div style={CHECKBOX_CONTAINER_STYLE}>
                  <Checkbox checked={item.isChoosed} readOnly />
                  <span style={SPINNER_MARGIN_STYLE}>{localizedName}</span>
                </div>
              </Cell>
            );
          })}
        </AccordionContent>
      </Accordion>
    );
  }
);

SortAccordion.displayName = 'SortAccordion';

export const CatalogPage: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  // Мемоизация начального значения сортировки
  const firstSort = useMemo(
    () => FIRST_SORT_NAMES[`name_${language}` as keyof typeof FIRST_SORT_NAMES],
    [language]
  );

  // State
  const [arrayTypesForRender, setArrayTypesForRender] = useState<TypeItem[]>([]);
  const [allGoods, setAllGoods] = useState<GoodItemType[]>([]);
  const [arrayGoodsForRender, setArrayGoodsForRender] = useState<GoodItemType[]>([]);
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [activeTypeId, setActiveTypeId] = useState<string | number | null>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [spinBtn, setSpinBtn] = useState(false);
  const [salesInfo, setSalesInfo] = useState<any[]>([]); // TODO: создать правильный тип Sale из BannersSwiper
  const [isShowBanner, setIsShowBanner] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [sortType, setSortType] = useState(firstSort);
  const [sortVariant, setSortVariant] = useState<SortVariantItem[]>(SORT_OPTIONS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wentWrong, setWentWrong] = useState(false);

  const domen = import.meta.env.VITE_DOMEN;

  const { addToCartT, itemAdded, sortByT, errorT, btnErrorT } = TEXTS[language as LanguageKey];

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // Мемоизированная функция сортировки товаров
  const sortGoods = useCallback((goods: GoodItemType[], sortType: string) => {
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
        return sortedGoods.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return sortedGoods.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return sortedGoods;
    }
  }, []);

  // получить список типов товаров + товары
  useEffect(() => {
    const fetchGoodsTypesInfo = async () => {
      try {
        const types = await axios.get('/user_get_goodsstype');
        const goods = await axios.get('/user_get_goods', {
          params: { tlgid: tlgid },
        });

        console.log('GOODS', goods);

        const arrayTemp: TypeItem[] = (types.data as ApiGoodsTypeItem[]).map((item) => ({
          name: item[`name_${language}` as keyof ApiGoodsTypeItem] as string,
          id: item._id,
        }));

        const allElement: Record<LanguageKey, string> = {
          ru: 'Все',
          en: 'All',
          de: 'Alle',
        };

        const arrayTypesForRender: TypeItem[] = [
          { name: allElement[language as LanguageKey], id: 1 },
          ...arrayTemp,
        ];
        setArrayTypesForRender(arrayTypesForRender);

        const arrayGoodsForRender: GoodItemType[] = (goods.data as ApiGoodItem[]).map((item) => ({
          name: item[`name_${language}` as keyof ApiGoodItem] as string,
          description_short: item[`description_short_${language}` as keyof ApiGoodItem] as string,
          img: `${domen}${item.file.url}`,
          id: item._id,
          type: item.type,
          price: item.priceToShow,
          basePrice: item.basePriceToShowClientValute,
          isSaleNow: item.isSaleNow,
          valuteToShow: item.valuteToShow,
          chipInfo: item.saleInfo
            ? item.saleInfo[`infoForFront_${language}` as keyof SaleInfo]
            : '',
          quantityOfPurchases: item.quantityOfPurchases || 0,
          price_eu: item.price_eu || 0,
        }));

        setAllGoods(arrayGoodsForRender);
        setArrayGoodsForRender(arrayGoodsForRender);

        console.log('formattedTypes', arrayTypesForRender);
        console.log('formattedGoods', arrayGoodsForRender);
      } catch (error) {
        setWentWrong(true);
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setIsLoading(false)
      }
    };

    fetchGoodsTypesInfo();
  }, [language, domen, tlgid]); // Добавлены зависимости

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
        setWentWrong(true);
        console.error('Ошибка при загрузке данных об акциях:', error);
      } 
    }; 

    fetchSalesInfo();
  }, []);

  // Мемоизированный обработчик клика по карточке товара
  const cardPressedHandler = useCallback(
    (e: any) => {
      console.log('card Pressed', e.currentTarget.id);
      navigate('/onegood-page', {
        state: {
          itemid: e.currentTarget.id,
        },
      });
    },
    [navigate]
  );

  // Мемоизированная функция применения сортировки к товарам
  const applySortToGoods = useCallback(
    (sortKey: string) => {
      let filteredGoods: GoodItemType[] = [];
      if (String(activeTypeId) === '1') {
        filteredGoods = allGoods;
      } else {
        filteredGoods = allGoods.filter(
          (item) => item.type === String(activeTypeId)
        );
      }

      const sortedGoods = sortGoods(filteredGoods, sortKey);
      setArrayGoodsForRender(sortedGoods);
    },
    [activeTypeId, allGoods, sortGoods]
  );

  // Мемоизированный обработчик выбора типа товара
  const typePressedHandler = useCallback(
    (typeId: string) => {
      console.log('you choose type=', typeId);

      let filteredGoods: GoodItemType[] = [];
      if (typeId === '1') {
        filteredGoods = allGoods;
      } else {
        filteredGoods = allGoods.filter((item) => item.type === typeId);
      }

      // Получаем текущий ключ сортировки из выбранного варианта
      const selectedVariant = sortVariant.find((item) => item.isChoosed);
      const currentSortKey = selectedVariant
        ? selectedVariant.sortKey
        : 'popularity_asc';

      // Применяем сортировку к отфильтрованным товарам
      const sortedGoods = sortGoods(filteredGoods, currentSortKey);
      setArrayGoodsForRender(sortedGoods);
      setActiveTypeId(typeId === '1' ? 1 : typeId);
    },
    [allGoods, sortVariant, sortGoods]
  );

  // Мемоизированный обработчик добавления товара в корзину с обработкой ошибок
  const addToCartHandler = useCallback(
    async (goodId: string) => {
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
        setErrorMessage(null);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        const errorText: Record<LanguageKey, string> = {
          ru: 'Не удалось добавить товар в корзину',
          en: 'Failed to add item to cart',
          de: 'Artikel konnte nicht in den Warenkorb gelegt werden',
        };
        setErrorMessage(errorText[language as LanguageKey] || errorText.en);
      } finally {
        setSpinBtn(false);
      }
    },
    [tlgid, language]
  );

  // Мемоизированный обработчик закрытия Snackbar
  const snakHandler = useCallback(() => {
    setOpenSnakbar(false);
  }, []);

  // Мемоизированный обработчик изменения состояния аккордеона
  const handleAccordionChange = useCallback((orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  }, []);

  // Мемоизированный обработчик выбора варианта сортировки
  const handleSortVariantSelect = useCallback(
    (selectedId: number) => {
      setIsSorting(true);

      // Обновляем состояние вариантов сортировки
      const updatedVariants = sortVariant.map((item) => ({
        ...item,
        isChoosed: item.id === selectedId,
      }));
      setSortVariant(updatedVariants);

      // Находим выбранный вариант и обновляем текущий тип сортировки
      const selectedVariant = sortVariant.find(
        (item) => item.id === selectedId
      );
      if (selectedVariant) {
        const localizedSortName = selectedVariant[`name_${language}` as keyof Pick<SortVariantItem, 'name_ru' | 'name_en' | 'name_de'>];
        setSortType(localizedSortName);

        // Применяем сортировку
        applySortToGoods(selectedVariant.sortKey);
      }

      // Закрываем accordion
      setExpandedOrderId(null);

      // Скрываем лоадер через короткое время
      setTimeout(() => {
        setIsSorting(false);
      }, 300);
    },
    [sortVariant, language, applySortToGoods]
  );

  // Мемоизация пропсов для BannersSwiper
  const bannerProps = useMemo(
    () => ({
      sales: salesInfo,
      language,
      domen,
    }),
    [salesInfo, language, domen]
  );

  // Early return для ошибки
  if (wentWrong) {
    return (
      <Page back={false}>
        <Section>
          <Cell>
            <div style={ERROR_MESSAGE_STYLE}>{errorT}</div>
            <Button onClick={() => window.location.reload()} size="m">
              {btnErrorT}
            </Button>
          </Cell>
        </Section>
        <TabbarMenu />
      </Page>
    );
  }

  return (
    <Page back={false}>
      {isLoading && (
        <div style={SPINNER_CONTAINER_STYLE}>
          <Spinner size="m" />
        </div>
      )}

      {!isLoading && (
        <>
          <List>
            <Section style={SECTION_STYLE}>
              {isShowBanner && salesInfo.length > 0 && (
                <BannersSwiper {...bannerProps} />
              )}

              <TypeFilter
                types={arrayTypesForRender}
                activeTypeId={activeTypeId}
                onTypeSelect={typePressedHandler}
              />

              <SortAccordion
                expanded={expandedOrderId === '1'}
                sortType={sortType}
                isSorting={isSorting}
                sortVariant={sortVariant}
                language={language}
                sortByT={sortByT}
                onAccordionChange={() => handleAccordionChange('1')}
                onSortSelect={handleSortVariantSelect}
              />

              {arrayGoodsForRender.map((item: GoodItemType) => (
                <GoodCard
                  key={item.id}
                  item={item}
                  onCardClick={cardPressedHandler}
                  onAddToCart={addToCartHandler}
                  spinBtn={spinBtn}
                  addToCartT={addToCartT}
                />
              ))}
            </Section>
          </List>

          <TabbarMenu />

          {openSnakbar && (
            <Snackbar duration={1200} onClose={snakHandler}>
              {itemAdded}
            </Snackbar>
          )}

          {errorMessage && (
            <Snackbar duration={3000} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Snackbar>
          )}
        </>
      )}
    </Page>
  );
};
