import { Section, Button, Text, Cell } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { Page } from '@/components/Page.tsx';
import { LanguageContext } from '../../components/App.tsx';

import { TEXTS } from './texts.ts';

export const SuccessPage: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  //@ts-ignore
    const { successT, infoT, myOrderT } = TEXTS[language];

  if (settingsButton.mount.isAvailable()) {
    settingsButton.mount();
    settingsButton.isMounted();
    settingsButton.show();
  }

  if (settingsButton.onClick.isAvailable()) {
    function listener() {
      console.log('Clicked!');
      navigate('/setting-button-menu');
    }
    settingsButton.onClick(listener);
  }

  const goToCatalog = () => {
    navigate('/myorders-page');
  };

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
