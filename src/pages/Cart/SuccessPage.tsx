import { Section, Button, Text, Cell } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext, useCallback } from 'react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { Page } from '@/components/Page.tsx';
import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts.ts';
import { useSettingsButton } from '@/hooks/useSettingsButton';

export const SuccessPage: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  // Безопасная типизация для доступа к текстам
  const currentLanguage = (language in TEXTS ? language : 'ru') as keyof typeof TEXTS;
  const { successT, infoT, myOrderT } = TEXTS[currentLanguage];

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // Мемоизированный обработчик для кнопки
  const goToCatalog = useCallback(() => {
    navigate('/myorders-page');
  }, [navigate]);

  return (
    <Page back={false}>
      <Section>
        <Cell>
          <Text weight="2">{successT}</Text>
        </Cell>
        <Cell multiline>
          {infoT}
        </Cell>


      
      
         <Section style={{ marginBottom: 100, padding: 10 }}>

            <Button stretched onClick={goToCatalog} style={{ marginTop: '20px' }}>
              {myOrderT}
            </Button>
        </Section>

      </Section>

      <TabbarMenu />
    </Page>
  );
};
