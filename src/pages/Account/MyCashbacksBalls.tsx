import {
  Section,
  Spinner,
  Cell,
  Accordion,
  Button,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { TabbarMenu } from '@/components/TabbarMenu/TabbarMenu';
import { useTlgid } from '@/components/Tlgid';
import { Page } from '@/components/Page';
import { useTexts } from '@/hooks/useTexts';
import { useCashbackData } from '@/hooks/useCashbackData';
import { ACCOUNT_STYLES } from '@/constants/styles';
import type { CashbackLevel } from '@/types/i18n.types';
import { TEXTS } from './texts';
import { useSettingsButton } from '@/hooks/useSettingsButton';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';

export const MyCashbacksBalls: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const texts = useTexts(TEXTS);

  const {
    myInfoT,
    purchaseQtyT,
    pcsT,
    purchaseSumT,
    clientCashbackLevelT,
    deltaToNextLevelT,
    maxLevelT,
    levelT,
    totalSumT,
    fromPurchaseT,
    cashbackBallT,
    howCBworksT,
    cashbackLevelsT,
    cashbackInfoT,
    renewT,
    btnErrorT,
    errorT
  } = texts;

  // UI state (not server data)
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // ✅ React Query
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching, // true when background refetch is happening
  } = useCashbackData(tlgid);

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // Memoized handler
  const handleAccordionToggle = useCallback(() => {
    setIsAccordionOpen((prev) => !prev);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Page back={true}>
        <div style={ACCOUNT_STYLES.loadingContainer}>
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

  // Error state
  if (error) {
    return (
      <Page back={true}>
        <Section>
          <Cell>
            <div style={{ color: 'red', marginBottom: '10px' }}>
              {error instanceof Error
                ? error.message
                : errorT}
            </div>
            <Button onClick={() => refetch()} size="m">
              {btnErrorT}
            </Button>
          </Cell>
        </Section>
      </Page>
    );
  }

  // No data (should not happen, but just in case)
  if (!data) return null;

  return (
    <Page back={true}>
      {/* Background refetch indicator */}
      {isFetching && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: '#007AFF',
            color: 'white',
            padding: '5px 10px',
            borderRadius: 5,
            fontSize: 12,
            zIndex: 1000,
          }}
        >
          {renewT}
        </div>
      )}

      <Section header={myInfoT} style={ACCOUNT_STYLES.sectionMarginBottom}>
        <Cell after={`${data.cashbackBall} ${data.valute}`}>
          {cashbackBallT}
        </Cell>
        <Cell after={`${data.purchaseQty} ${pcsT}`}>{purchaseQtyT}</Cell>
        <Cell after={`${data.totalSumInUserCurrency} ${data.valute}`}>
          {purchaseSumT}
        </Cell>
        <Cell
          after={`${data.currentCashbackLevel} (${data.currentPercent}%)`}
        >
          {clientCashbackLevelT}
        </Cell>
        <Cell
          after={
            data.deltaToNextLevelInUserCurrency > 0
              ? `${data.deltaToNextLevelInUserCurrency} ${data.valute}`
              : maxLevelT
          }
        >
          {deltaToNextLevelT}
        </Cell>
      </Section>

      <Section
        header={howCBworksT}
        style={ACCOUNT_STYLES.sectionMarginBottomLarge}
      >
        <Accordion
          expanded={isAccordionOpen}
          onChange={handleAccordionToggle}
        >
          <AccordionSummary>{cashbackLevelsT}</AccordionSummary>
          <AccordionContent>
            <Cell multiline>{cashbackInfoT}</Cell>
            {data.sortedLevelsUserCurrency.map((level: CashbackLevel) => (
              <Cell
                key={level._id}
                subtitle={`${totalSumT} ${level.sum} ${data.valute}`}
              >
                {levelT} {level.position} - {level.percent}% {fromPurchaseT}
              </Cell>
            ))}
          </AccordionContent>
        </Accordion>
      </Section>

      <TabbarMenu />
    </Page>
  );
};
