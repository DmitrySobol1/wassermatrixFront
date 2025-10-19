import {
  Cell,
  Button,
  Section,
  Spinner,
  Banner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import axios from '../../axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { Page } from '@/components/Page.tsx';
import { useSettingsButton } from '@/hooks/useSettingsButton';
import { TEXTS } from './texts.ts';

// ============================================================================
// Типы
// ============================================================================

interface SaleFile {
  url: string;
}

interface SaleGood {
  _id: string;
}

interface SaleInfo {
  _id: string;
  file?: SaleFile;
  title_ru?: string;
  title_en?: string;
  title_de?: string;
  subtitle_ru?: string;
  subtitle_en?: string;
  subtitle_de?: string;
  info_ru?: string;
  info_en?: string;
  info_de?: string;
  dateUntil?: string;
  isShowButton: boolean;
  good: SaleGood;
}

// ============================================================================
// Константы стилей
// ============================================================================

const SPINNER_CONTAINER_STYLE: React.CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
  padding: '100px',
};

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 100,
};

const IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  height: 'auto',
  objectFit: 'cover',
  width: '100%',
  objectPosition: 'center',
};

const BUTTON_SECTION_STYLE: React.CSSProperties = {
  marginBottom: 100,
  padding: 10,
};

const ERROR_SECTION_STYLE: React.CSSProperties = {
  textAlign: 'center',
  padding: '20px',
};

// ============================================================================
// Основной компонент
// ============================================================================

export const SalePage: FC = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { saleId } = location.state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [saleInfo, setSaleInfo] = useState<SaleInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const domen = import.meta.env.VITE_DOMEN;
  const { buttonT, actionTillT } = TEXTS[language];

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  useSettingsButton(handleSettingsClick);

  // Функция загрузки данных об акции
  const fetchSaleInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/admin_get_sales');

      if (response.data && response.data.length > 0) {
        const sale = saleId
          ? response.data.find((sale: SaleInfo) => sale._id === saleId)
          : response.data[0];

        if (sale) {
          setSaleInfo(sale);
        } else {
          setError('Акция не найдена');
        }
      } else {
        setError('Нет доступных акций');
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных об акции:', err);
      setError('Не удалось загрузить данные об акции');
    } finally {
      setIsLoading(false);
    }
  }, [saleId]);

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchSaleInfo();
  }, [fetchSaleInfo]);

  // Мемоизированный обработчик перехода к товару
  const handleGoToGood = useCallback(() => {
    if (saleInfo?.good?._id) {
      navigate('/onegood-page', {
        state: {
          itemid: saleInfo.good._id,
        },
      });
    }
  }, [saleInfo?.good?._id, navigate]);

  // Мемоизация форматированной даты
  const formattedDate = useMemo(() => {
    if (!saleInfo?.dateUntil) return null;
    return new Date(saleInfo.dateUntil).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [saleInfo?.dateUntil]);

  // Мемоизация локализованных полей
  const localizedTitle = useMemo(
    () => saleInfo?.[`title_${language}` as keyof SaleInfo] as string | undefined,
    [saleInfo, language]
  );

  const localizedSubtitle = useMemo(
    () => saleInfo?.[`subtitle_${language}` as keyof SaleInfo] as string | undefined,
    [saleInfo, language]
  );

  const localizedInfo = useMemo(
    () => saleInfo?.[`info_${language}` as keyof SaleInfo] as string | undefined,
    [saleInfo, language]
  );

  // Мемоизация URL изображения
  const imageUrl = useMemo(() => {
    return saleInfo?.file?.url
      ? `${domen}${saleInfo.file.url}`
      : 'https://www.nasa.gov/wp-content/uploads/2023/10/streams.jpg?resize=1536,864';
  }, [saleInfo?.file?.url, domen]);

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

  // Early return для error state
  if (error) {
    return (
      <Page back={true}>
        <Section style={ERROR_SECTION_STYLE}>
          <Cell multiline>{error}</Cell>
          <Button onClick={fetchSaleInfo} stretched>
            Повторить попытку
          </Button>
        </Section>
      </Page>
    );
  }

  // Early return если нет данных
  if (!saleInfo) {
    return (
      <Page back={true}>
        <Section style={ERROR_SECTION_STYLE}>
          <Cell>Акция не найдена</Cell>
        </Section>
      </Page>
    );
  }

  // Основной рендер
  return (
    <Page back={true}>
      <Section style={SECTION_STYLE}>
        <Banner
          background={
            <img
              alt={saleInfo.file?.url ? 'Sale banner' : 'Default banner'}
              src={imageUrl}
              style={IMAGE_STYLE}
            />
          }
          header={localizedTitle}
          subheader={localizedSubtitle}
          type="inline"
        >
          <Cell>{''}</Cell>
        </Banner>

        {formattedDate && (
          <Cell>
            {actionTillT} {formattedDate}
          </Cell>
        )}

        {localizedInfo && <Cell multiline>{localizedInfo}</Cell>}

        {saleInfo.isShowButton && (
          <Section style={BUTTON_SECTION_STYLE}>
            <Button onClick={handleGoToGood} stretched>
              {buttonT}
            </Button>
          </Section>
        )}
      </Section>

      <TabbarMenu />
    </Page>
  );
};
