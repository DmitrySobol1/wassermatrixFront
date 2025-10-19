// ============================================================================
// React & hooks
// ============================================================================
import { type FC, useCallback, useContext } from 'react';

// ============================================================================
// Routing
// ============================================================================
import { useNavigate } from 'react-router-dom';

// ============================================================================
// UI components
// ============================================================================
import { Section, Button, Text, Cell } from '@telegram-apps/telegram-ui';

// ============================================================================
// Local components & hooks
// ============================================================================
import { Page } from '@/components/Page.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { LanguageContext } from '../../components/App.tsx';
import { useSettingsButton } from '@/hooks/useSettingsButton';

// ============================================================================
// Data
// ============================================================================
import { TEXTS } from './texts.ts';

// ============================================================================
// Константы стилей
// ============================================================================

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 100,
  padding: 0,
};

const BUTTON_STYLE: React.CSSProperties = {
  marginTop: '20px',
};

// ============================================================================
// Основной компонент
// ============================================================================

/**
 * Страница отмены платежа
 *
 * Отображается когда платеж не прошел или был отменен пользователем.
 * Предоставляет информацию о проблеме и возможность вернуться к заказу.
 *
 * Основные возможности:
 * - Уведомление пользователя о неудачной оплате
 * - Навигация на страницу "Мои заказы" для повторной попытки оплаты
 * - Поддержка мультиязычности (ru, en, de)
 * - Интеграция с Telegram settings button
 *
 * Маршрут: /cancellpay-page
 *
 * Оптимизации производительности:
 * - Мемоизация обработчиков событий (useCallback)
 * - Константные стили вместо инлайн-объектов (предотвращает лишние ре-рендеры)
 * - Правильная очистка settingsButton listener через useSettingsButton hook
 */
export const CancellPay: FC = () => {
  const { language } = useContext(LanguageContext);

  const { errorT, goToT, goToBtnT } = TEXTS[language];

  const navigate = useNavigate();

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // Мемоизированный обработчик для кнопки
  const goToOrders = useCallback(() => {
    navigate('/myorders-page');
  }, [navigate]);

  return (
    <Page back={false}>
      <Section style={SECTION_STYLE}>
        <Cell>
          <Text weight="2">{errorT}</Text>
        </Cell>
        <Cell multiline>{goToT}</Cell>

        <Button stretched onClick={goToOrders} style={BUTTON_STYLE}>
          {goToBtnT}
        </Button>
      </Section>

      <TabbarMenu />
    </Page>
  );
};
