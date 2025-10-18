import { Section, Button, Text, Cell } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useContext } from 'react';
// import { LanguageContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { Page } from '@/components/Page.tsx';

export const CancellPay: FC = () => {
  // const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

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
          <Text weight="2">Что-то пошло не так!</Text>
        </Cell>
        <Cell multiline>
          Перейдите в раздел "аккаунт &gt; заказы" и оплатите заказ
        </Cell>


      
      
         <Section style={{ marginBottom: 100, padding: 10 }}>

            <Button stretched onClick={goToCatalog} style={{ marginTop: '20px' }}>
              В аккаунт &gt; заказы
            </Button>
        </Section>

      </Section>

      <TabbarMenu />
    </Page>
  );
};
