/**
 * Страница "Мои промокоды"
 *
 * Отображает список персональных промокодов пользователя с возможностью копирования.
 *
 * Основные возможности:
 * - Загрузка персональных промокодов пользователя из API
 * - Отображение информации о промокоде (код, скидка, срок действия, описание)
 * - Копирование промокода в буфер обмена по клику
 * - Мультиязычность (ru, en, de)
 * - Оптимизированный рендеринг с мемоизацией
 *
 * Оптимизации производительности:
 * - Мемоизация обработчиков событий (useCallback)
 * - Мемоизация компонента PromocodeItem (memo)
 * - Мемоизация форматирования дат (useMemo)
 * - Early return pattern для loading state
 * - Правильная очистка settingsButton listener
 */
import {
  Section,
  Spinner,
  Cell,
  Snackbar,
  Button,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect, useState, useContext, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import axios from '../../axios';

// ============================================================================
// Типы
// ============================================================================
interface PersonalPromocode {
  _id: string;
  code: string;
  saleInPercent: number;
  expiryDate: string;
  description_users_en: string;
  description_users_ru?: string;
  description_users_de?: string;
}

interface PromocodesResponse {
  status: 'ok' | 'error';
  promocodes: PersonalPromocode[];
}

// ============================================================================
// Константы стилей
// ============================================================================
const SPINNER_CONTAINER_STYLE: React.CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
  padding: '100px',
};

const CELL_STYLE: React.CSSProperties = {
  cursor: 'pointer',
};

const ERROR_MESSAGE_STYLE: React.CSSProperties = {
  color: 'red',
  marginBottom: '10px',
};

// ============================================================================
// Вспомогательные компоненты
// ============================================================================

/**
 * Мемоизированный компонент для отображения одного промокода
 *
 * Оптимизации:
 * - React.memo предотвращает лишние ре-рендеры
 * - useMemo для форматирования даты (вызывается только при изменении даты)
 * - useMemo для выбора описания на текущем языке
 * - useCallback для обработчика клика
 */
const PromocodeItem = memo<{
  promocode: PersonalPromocode;
  language: string;
  saleT: string;
  validUntilT: string;
  onCopy: (code: string) => void;
}>(({ promocode, language, saleT, validUntilT, onCopy }) => {
  // Мемоизация форматирования даты
  const expiryDate = useMemo(
    () => new Date(promocode.expiryDate).toLocaleDateString(),
    [promocode.expiryDate]
  );

  // Мемоизация описания на текущем языке
  const description = useMemo(
    () => promocode[`description_users_${language}` as keyof PersonalPromocode] || promocode.description_users_en,
    [promocode, language]
  );

  // Мемоизация обработчика клика
  const handleClick = useCallback(() => {
    onCopy(promocode.code);
  }, [onCopy, promocode.code]);

  return (
    <Cell
      key={promocode._id}
      multiline
      subtitle={`${saleT} ${promocode.saleInPercent}% | ${validUntilT} ${expiryDate}`}
      description={description as string}
      onClick={handleClick}
      style={CELL_STYLE}
    >
      {promocode.code}
    </Cell>
  );
});

PromocodeItem.displayName = 'PromocodeItem';

// ============================================================================
// Основной компонент
// ============================================================================

/**
 * Компонент страницы "Мои промокоды"
 */
export const MyPromocodes: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);

  const texts = TEXTS[language as keyof typeof TEXTS] ?? TEXTS.en;
  const { myPromocodesT, saleT, validUntilT, notPromocodeT, footerPromocodesT, copiedT, errorT, btnErrorT } = texts;

  const [isLoading, setIsLoading] = useState(true);
  const [promocodes, setPromocodes] = useState<PersonalPromocode[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  // Настройка settingsButton с правильным cleanup
  useEffect(() => {
    if (settingsButton.mount.isAvailable()) {
      settingsButton.mount();
      settingsButton.show();
    }

    const listener = () => {
      navigate('/setting-button-menu');
    };

    let cleanup: (() => void) | undefined;

    if (settingsButton.onClick.isAvailable()) {
      const unsubscribe = settingsButton.onClick(listener);

      cleanup = () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
        if (settingsButton.unmount && typeof settingsButton.unmount === 'function') {
          settingsButton.unmount();
        }
      };
    }

    return cleanup;
  }, [navigate]);

  // Получаем промокоды пользователя
  useEffect(() => {
    const fetchPromocodes = async () => {
      if (!tlgid) {
        setIsLoading(false);
        setHasError(true);
        setSnackbarMessage('Ошибка: не удалось определить пользователя');
        setOpenSnackbar(true);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);
        const response = await axios.get<PromocodesResponse>(
          '/user_get_personal_promocodes',
          { params: { tlgid } }
        );

        if (response.data.status === 'ok') {
          setPromocodes(response.data.promocodes);
        } else {
          throw new Error('Server returned error status');
        }
      } catch (error) {
        console.error('Ошибка при получении промокодов:', error);
        setHasError(true);
        setSnackbarMessage('Не удалось загрузить промокоды');
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromocodes();
  }, [tlgid]);

  // Мемоизированная функция копирования промокода в буфер обмена
  const copyToClipboard = useCallback(async (promocode: string) => {
    try {
      await navigator.clipboard.writeText(promocode);
      setSnackbarMessage(copiedT);
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Ошибка копирования:', error);
      setSnackbarMessage('Ошибка копирования');
      setOpenSnackbar(true);
    }
  }, [copiedT]);

  // Мемоизированный обработчик закрытия Snackbar
  const handleCloseSnackbar = useCallback(() => {
    setOpenSnackbar(false);
  }, []);

  // Функция для повторной загрузки промокодов
  const refetch = useCallback(async () => {
    if (!tlgid) {
      setHasError(true);
      setSnackbarMessage('Ошибка: не удалось определить пользователя');
      setOpenSnackbar(true);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      setOpenSnackbar(false);

      const response = await axios.get<PromocodesResponse>(
        '/user_get_personal_promocodes',
        { params: { tlgid } }
      );

      if (response.data.status === 'ok') {
        setPromocodes(response.data.promocodes);
      } else {
        throw new Error('Server returned error status');
      }
    } catch (error) {
      console.error('Ошибка при получении промокодов:', error);
      setHasError(true);
      setSnackbarMessage('Не удалось загрузить промокоды');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [tlgid]);

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
  
  // Early return для error
  if (hasError) {
    return (
      <Page back={true}>
              <Section>
                <Cell>
                  <div style={ERROR_MESSAGE_STYLE}>
                     {errorT}
                  </div>
                  <Button onClick={refetch} size="m">
                    {btnErrorT}
                  </Button>
                </Cell>
              </Section>
            </Page>
    );
  }

  return (
    <Page back={true}>
      <Section
        header={myPromocodesT}
        footer={promocodes.length === 0 ? '': footerPromocodesT}
      >
        {promocodes.length === 0 ? (
         
           <Cell>{notPromocodeT}</Cell> 
        ) : (
          promocodes.map((promocode) => (
            <PromocodeItem
              key={promocode._id}
              promocode={promocode}
              language={language}
              saleT={saleT}
              validUntilT={validUntilT}
              onCopy={copyToClipboard}
            />
          ))
        )}
      </Section>

      {openSnackbar && (
        <Snackbar duration={2000} onClose={handleCloseSnackbar}>
          {snackbarMessage}
        </Snackbar>
      )}

      <TabbarMenu />
    </Page>
  );
};
