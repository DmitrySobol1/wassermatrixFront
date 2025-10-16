import {
  Section,
  Spinner,
  Cell,
  Accordion,
  Button,
  Subheadline,
} from '@telegram-apps/telegram-ui';
import type { FC, CSSProperties } from 'react';
import { useEffect, useState, useContext, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';

import axios from '../../axios';

// ============================================================================
// Типы
// ============================================================================

/**
 * Интерфейс реферала
 */
interface Referal {
  son: string;
  username?: string;
  father: string;
  isSonEnterToApp: boolean;
}

/**
 * Интерфейс информации о количественных промокодах
 */
interface QuantityInfo {
  qty: number;
  sale: number;
  _id: string;
}


/**
 * Пропсы компонента ReferalItem
 */
interface ReferalItemProps {
  referal: Referal;
  index: number;
}

/**
 * Пропсы компонента QuantityInfoItem
 */
interface QuantityInfoItemProps {
  info: QuantityInfo;
  index: number;
  zaT: string;
  za2T: string;
}

// ============================================================================
// Константы стилей
// ============================================================================

const SPINNER_CONTAINER_STYLE: CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
  padding: '100px',
};

const SECTION_MARGIN_STYLE: CSSProperties = {
  marginBottom: 10,
};

const SECTION_BOTTOM_MARGIN_STYLE: CSSProperties = {
  marginBottom: 100,
};

const BUTTON_STYLE: CSSProperties = {
  marginLeft: 20,
  marginBottom: 10,
};

const BUTTON_CONTENT_STYLE: CSSProperties = {
  display: 'flex',
  gap: 5,
  alignItems: 'center',
};

const CELL_ZERO_MARGIN_STYLE: CSSProperties = {
  marginTop: 0,
};

// ============================================================================
// Вспомогательные функции
// ============================================================================

/**
 * Генерирует реферальную ссылку для пользователя
 *
 * @param tlgid - Telegram ID пользователя
 * @param language - Код языка (en, ru, de)
 * @returns Сгенерированная реферальная ссылка
 */
const generateReferralLink = (tlgid: number | string, language: string): string => {
  const TEMPLATE_LINK = '12345678-ed1e-4477-8e19-1b8e71ab2689';
  const newId = tlgid.toString() + 'e';
  const firstPart = newId.padEnd(8, '0').slice(0, 8);
  const secondPart = newId.padEnd(12, '0').slice(8, 12);
  const thirdPart = TEMPLATE_LINK.split('-').slice(2).join('-');
  let reflink = `${firstPart}-${secondPart}-${thirdPart}`;
  reflink = reflink.slice(0, -2) + language;
  return reflink;
};

// ============================================================================
// Вспомогательные компоненты
// ============================================================================

/**
 * Мемоизированный компонент для отображения реферала
 *
 * Оптимизации:
 * - React.memo предотвращает лишние ре-рендеры
 * - Использует стабильный key (son id)
 */
const ReferalItem = memo<ReferalItemProps>(({ referal, index }) => (
  <div>
    <Subheadline level="1" weight="3">
      {index + 1}) {referal.username
        ? `username: ${referal.username}`
        : `telegram id: ${referal.son}`}
    </Subheadline>
  </div>
));
ReferalItem.displayName = 'ReferalItem';

/**
 * Мемоизированный компонент для отображения информации о количественных промокодах
 */
const QuantityInfoItem = memo<QuantityInfoItemProps>(({ info, index, zaT, za2T }) => (
  <div>
    <div>
      <Subheadline level="1" weight="3">
        {index + 1}) {zaT} {info.qty} {za2T} -{info.sale}%
      </Subheadline>
    </div>
  </div>
));
QuantityInfoItem.displayName = 'QuantityInfoItem';

// ============================================================================
// Основной компонент
// ============================================================================

/**
 * Компонент реферальной системы
 *
 * Функциональность:
 * - Отображает список рефералов пользователя
 * - Позволяет приглашать друзей через реферальную ссылку
 * - Показывает информацию о промокодах за количество рефералов
 * - Отображает информацию о кешбэке за покупки рефералов
 *
 * Оптимизации:
 * - useCallback для всех обработчиков событий
 * - React.memo для элементов списков
 * - Вынесение стилей в константы
 * - Early return для loading state
 * - Правильная очистка event listeners
 */
export const ReferalSystem: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);

  // Получаем тексты для текущего языка с fallback на английский
  const texts = TEXTS[language] || TEXTS['en'];
  const {
    refMessageT,
    referalSystemT,
    refInfoHeaderT,
    refInfoText1T,
    refInfoText2T,
    refInfoText3T,
    inviteBtnT,
    myReferalsT,
    listReferalsT,
    personT,
    noRefT,
    howRefWorksT,
    quantityRefT,
    zaT,
    za2T,
    getCbT,
    myCashbackT,
    purchasedT,
    cantLoadRefT
  } = texts;

  // ============================================================================
  // State
  // ============================================================================
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [referals, setReferals] = useState<Referal[]>([]);
  const [infoAboutQuantity, setInfoAboutQuantity] = useState<QuantityInfo[]>([]);
  const [infoAboutPurchase, setInfoAboutPurchase] = useState<number>(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // ============================================================================
  // Обработчики (мемоизированные с useCallback)
  // ============================================================================

  /**
   * Обработчик изменения состояния аккордеона
   * Только один аккордеон может быть открыт одновременно
   */
  const handleAccordionChange = useCallback((accordionId: string) => {
    setOpenAccordion((prev) => (prev === accordionId ? null : accordionId));
  }, []);

  /**
   * Обработчик кнопки приглашения друзей
   * Генерирует реферальную ссылку и открывает Telegram Share dialog
   */
  const btnAddFriendHandler = useCallback(() => {
    if (!tlgid) return; // Защита от undefined
    const reflink = generateReferralLink(tlgid, language);
    const link = `https://telegram.me/wassermatrix_bot?start=${reflink}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(refMessageT)}`;
    window.open(shareUrl, '_blank');
  }, [tlgid, language, refMessageT]);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Effect для инициализации Telegram Settings Button
   *
   * ВАЖНО: Включает cleanup для предотвращения утечки памяти
   */
  useEffect(() => {
    if (!settingsButton.mount.isAvailable()) return;

    // Монтируем и показываем кнопку
    settingsButton.mount();
    settingsButton.show();

    // Добавляем обработчик клика
    let unsubscribe: (() => void) | undefined;

    if (settingsButton.onClick.isAvailable()) {
      const listener = () => {
        navigate('/setting-button-menu');
      };

      const result = settingsButton.onClick(listener);
      // Сохраняем функцию отписки, если она возвращается
      if (typeof result === 'function') {
        unsubscribe = result;
      }
    }

    // Cleanup: удаляем обработчик и размонтируем кнопку
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      // Размонтируем кнопку при размонтировании компонента
      try {
        if (settingsButton.unmount) {
          settingsButton.unmount();
        }
      } catch (error) {
        // Игнорируем ошибки при размонтировании
        console.debug('Settings button unmount error:', error);
      }
    };
  }, [navigate]);

  /**
   * Effect для загрузки данных о рефералах и промокодах
   *
   * Выполняет 3 параллельных запроса:
   * 1. Получение списка рефералов
   * 2. Получение информации о количественных промокодах
   * 3. Получение информации о кешбэке за покупки
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [referalsResponse, quantityInfoResponse, purchaseInfoResponse] = await Promise.all([
          axios.get('/get_referals', {
            params: {
              father: tlgid,
              isSonEnterToApp: true,
            },
          }),
          axios.get('/referals_promoForQuantity'),
          axios.get('/referals_promoForPurchase'),
        ]);

        // Обработка ответа с рефералами
        if (referalsResponse.data.status === 'ok') {
          setReferals(referalsResponse.data.referals || []);
        }

        // Обработка ответа с количественными промокодами
        if (quantityInfoResponse.data) {
          setInfoAboutQuantity(quantityInfoResponse.data);
        }

        // Обработка ответа с информацией о покупках
        if (purchaseInfoResponse.data && purchaseInfoResponse.data.length > 0) {
          setInfoAboutPurchase(purchaseInfoResponse.data[0].sale);
        }
      } catch (err) {
        console.error('Ошибка при получении данных:', err);
        setError(cantLoadRefT);
        setReferals([]);
        setInfoAboutQuantity([]);
        setInfoAboutPurchase(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (tlgid) {
      fetchData();
    }
  }, [tlgid]);

  // ============================================================================
  // Render
  // ============================================================================

  // Early return для loading state
  if (isLoading) {
    return (
      <Page back={true}>
        <div style={SPINNER_CONTAINER_STYLE}>
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

  // Основной рендер
  return (
    <Page back={true}>
      {/* Отображение ошибки, если она есть */}
      {error && (
        <Section>
          <Cell multiline subtitle={error}></Cell>
        </Section>
      )}

      {/* Секция с информацией о реферальной системе и кнопкой приглашения */}
      <Section header={referalSystemT} style={SECTION_MARGIN_STYLE}>
        <Cell
          multiline
          subtitle={
            <>
              <div>1) {refInfoText1T}</div>
              <div>2) {refInfoText2T}</div>
            </>
          }
        >
          {refInfoHeaderT}
        </Cell>

        <Button onClick={btnAddFriendHandler} style={BUTTON_STYLE}>
          <div style={BUTTON_CONTENT_STYLE}>
            <AddCircleSharpIcon /> {inviteBtnT}
          </div>
        </Button>
      </Section>

      {/* Секция со списком рефералов */}
      <Section header={myReferalsT} style={SECTION_MARGIN_STYLE}>
        {referals.length === 0 ? (
          <Accordion
            expanded={openAccordion === 'referals'}
            onChange={() => handleAccordionChange('referals')}
          >
            <AccordionSummary>
              {listReferalsT} (0 {personT}):
            </AccordionSummary>

            <AccordionContent>
              <Cell multiline>{noRefT}</Cell>
            </AccordionContent>
          </Accordion>
        ) : (
          <Accordion
            expanded={openAccordion === 'referals'}
            onChange={() => handleAccordionChange('referals')}
          >
            <AccordionSummary>
              {listReferalsT} ({referals.length} {personT})
            </AccordionSummary>

            <AccordionContent>
              <Cell>
                {referals.map((referal, index) => (
                  <ReferalItem
                    key={referal.son}
                    referal={referal}
                    index={index}
                  />
                ))}
              </Cell>
            </AccordionContent>
          </Accordion>
        )}
      </Section>

      {/* Секция с информацией о том, как работает реферальная система */}
      <Section header={howRefWorksT} style={SECTION_BOTTOM_MARGIN_STYLE}>
        {/* Аккордеон с информацией о промокодах за количество рефералов */}
        <Accordion
          expanded={openAccordion === 'promocodes'}
          onChange={() => handleAccordionChange('promocodes')}
        >
          <AccordionSummary>{refInfoText3T}</AccordionSummary>
          <AccordionContent>
            <Cell multiline style={CELL_ZERO_MARGIN_STYLE}>
              <Subheadline level="1" weight="3">
                {quantityRefT}
              </Subheadline>
              {infoAboutQuantity.map((info, index) => (
                <QuantityInfoItem
                  key={info._id}
                  info={info}
                  index={index}
                  zaT={zaT}
                  za2T={za2T}
                />
              ))}
            </Cell>
          </AccordionContent>
        </Accordion>

        {/* Аккордеон с информацией о кешбэке */}
        <Accordion
          expanded={openAccordion === 'cashback'}
          onChange={() => handleAccordionChange('cashback')}
        >
          <AccordionSummary>{refInfoText2T}</AccordionSummary>
          <AccordionContent>
            <Cell multiline style={CELL_ZERO_MARGIN_STYLE}>
              <div>
                <Subheadline level="1" weight="3">
                  {getCbT}
                </Subheadline>
              </div>
              <div>
                <Subheadline level="1" weight="3">
                  {myCashbackT} = {infoAboutPurchase}% {purchasedT}
                </Subheadline>
              </div>
            </Cell>
          </AccordionContent>
        </Accordion>
      </Section>

      <TabbarMenu />
    </Page>
  );
};
