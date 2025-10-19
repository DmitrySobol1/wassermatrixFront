import {
  Cell,
  Button,
  Snackbar,
  Section,
  Spinner,
  Chip,
  Subheadline,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import axios from '../../axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { useSettingsButton } from '@/hooks/useSettingsButton';
import { Icon28AddCircle } from '@telegram-apps/telegram-ui/dist/icons/28/add_circle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import styles from './catalog.module.css';
import { TEXTS } from './texts.ts';

// TypeScript interfaces
interface GoodInfo {
  img: string;
  name: string;
  description_short: string;
  description_long: string;
  price: string;
  id: string;
  type: string;
  valuteToShow: string;
  basePrice: string;
  isSaleNow: boolean;
  infoForFront?: string;
}

interface TextsType {
  addToCartT: string;
  itemAdded: string;
  goodWatchT: string;
  peopleT: string;
  errorT: string;
  btnErrorT: string;
}

// Константы стилей (вне компонента для оптимизации)
const SPINNER_CONTAINER_STYLE: React.CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
  padding: '100px',
};

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 100,
};

const SALE_CHIP_STYLE: React.CSSProperties = {
  backgroundColor: '#ed6c02',
  padding: '5px 20px',
  marginLeft: 20,
};

const SALE_TEXT_STYLE: React.CSSProperties = {
  color: 'white',
};

const MARGIN_LEFT_20_STYLE: React.CSSProperties = {
  marginLeft: 20,
};

const MARGIN_RIGHT_10_STYLE: React.CSSProperties = {
  marginRight: 10,
};

const ERROR_MESSAGE_STYLE: React.CSSProperties = {
  color: 'red',
  marginBottom: '10px',
};

export const OneGood: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemid } = location.state || {};

  const [goodInfo, setGoodInfo] = useState<GoodInfo | null>(null);
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [spinBtn, setSpinBtn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewersCount] = useState(() => Math.floor(Math.random() * 11) + 5);

  const domen = import.meta.env.VITE_DOMEN;

  // Мемоизация текстов
  const texts = useMemo(() => TEXTS[language as keyof typeof TEXTS] as TextsType, [language]);
  const { addToCartT, itemAdded, goodWatchT, peopleT, errorT, btnErrorT } = texts;

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // получить товар по id
  useEffect(() => {
    // Проверка наличия itemid
    if (!itemid) {
      setError(errorT);
      setIsLoading(false);
      return;
    }

    const fetchGoodsTypesInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const good = await axios.get('/user_get_currentgood', {
          params: {
            id: itemid,
            tlgid: tlgid,
          },
        });

        if (import.meta.env.DEV) {
          console.log('GOOD', good);
        }

        const goodToRender: GoodInfo = {
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

        if (import.meta.env.DEV) {
          console.log('goodToRender', goodToRender);
        }

        setGoodInfo(goodToRender);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        setError(errorT);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoodsTypesInfo();
  }, [itemid, tlgid, language, domen, texts]);

  // Мемоизированный обработчик добавления в корзину
  const addToCartHandler = useCallback(async (goodId: string | undefined) => {
    if (!goodId) return;

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

      if (import.meta.env.DEV) {
        console.log(response.data);
      }
      setOpenSnakbar(true);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    } finally {
      setSpinBtn(false);
    }
  }, [tlgid]);

  // Мемоизированный обработчик закрытия Snackbar
  const snakHandler = useCallback(() => {
    setOpenSnakbar(false);
    setSpinBtn(false);
  }, []);


   // Early return для ошибки
    if (error) {
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
    <Page back={true}>
      {isLoading && (
        <div style={SPINNER_CONTAINER_STYLE}>
          <Spinner size="m" />
        </div>
      )}

      {/* {error && !isLoading && (
        <div style={SPINNER_CONTAINER_STYLE}>
          <Subheadline level="1" weight="3" style={{ marginBottom: 20 }}>
            {errorT}
          </Subheadline>
          <Button onClick={() => window.location.reload()}>
            {btnErrorT}
          </Button>
        </div>
      )} */}

      {!isLoading && !error && (
        <>
            <Section style={SECTION_STYLE}>
              <img src={goodInfo?.img || ''} className={styles.img} />

              { !goodInfo?.isSaleNow &&
              <div style={MARGIN_LEFT_20_STYLE}>
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
                style={SALE_CHIP_STYLE}>
                  <span style={SALE_TEXT_STYLE}>{goodInfo?.infoForFront}</span>
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
                multiline
              >
               <span style={MARGIN_RIGHT_10_STYLE}> {goodInfo?.name}</span>
               {goodInfo?.isSaleNow ? (
                <>
                  <span style={{ textDecoration: 'line-through', marginRight: 10 }}>
                    {goodInfo?.basePrice} {goodInfo?.valuteToShow}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {goodInfo?.price} {goodInfo?.valuteToShow}
                  </span>
                </>
               ) : `${goodInfo?.price} ${goodInfo?.valuteToShow}`}
              </Cell>

              <div className={styles.divAddBtn2}>
                <Button
                  before={<Icon28AddCircle />}
                  mode="filled"
                  size="m"
                  loading={spinBtn}
                  onClick={() => addToCartHandler(goodInfo?.id)}
                  stretched
                >
                  {addToCartT}
                </Button>
              </div>

              <Cell multiline>{goodInfo?.description_long}</Cell>
            </Section>

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
