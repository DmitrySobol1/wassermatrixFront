import {
    Button,
  Section,
  Spinner,
//   Cell,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import {  useState, useContext } from 'react';
// import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
// import axios from '../../axios';

export const ReferalSystem: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);

  //@ts-ignore
  const { myPromocodesT, saleT, validUntilT, notPromocodeT, footerPromocodesT, copiedT} = TEXTS[language];

  const [isLoading] = useState(false);

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

// function btnAddFriendHandler() {
//     const temptlgid = tlgid
//     const templatelink = '12345678-ed1e-4477-8e19-1b8e71ab2689';
//     //@ts-ignore
//     let newId = temptlgid.toString() + 'e';
//     const firstPart = newId.padEnd(8, '0').slice(0, 8); 
//     const secondPart = newId.padEnd(12, '0').slice(8, 12); 
//     const thirdPart = templatelink.split('-').slice(2).join('-');
//     let reflink = `${firstPart}-${secondPart}-${thirdPart}`;
//     reflink = reflink.slice(0, -2)
//     // reflink = reflink + languageInteger
//     reflink = reflink + 'en'

//     // const msgtxt = tlgMessage;
//     const msgtxt = 'message to user';
//     //@ts-ignore
//     const link = `https://telegram.me/wolf_games_bot?start=${reflink}`;

//     (window as any).Telegram.WebApp.openTelegramLink(
//       `https://t.me/share/url?url=${msgtxt} ${link}`
//     );
//   }

  function btnAddFriendHandler() {
    const temptlgid = tlgid
    const templatelink = '12345678-ed1e-4477-8e19-1b8e71ab2689';
    //@ts-ignore
    let newId = temptlgid.toString() + 'e';
    const firstPart = newId.padEnd(8, '0').slice(0, 8); 
    const secondPart = newId.padEnd(12, '0').slice(8, 12); 
    const thirdPart = templatelink.split('-').slice(2).join('-');
    let reflink = `${firstPart}-${secondPart}-${thirdPart}`;
    reflink = reflink.slice(0, -2)
    // reflink = reflink + languageInteger
    reflink = reflink + 'en'

    // const msgtxt = tlgMessage;
    const msgtxt = 'message to user';
    //@ts-ignore
    const link = `https://telegram.me/wolf_games_bot?start=${reflink}`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msgtxt)}`;
    window.open(shareUrl, '_blank');
  }


  return (
    <Page back={true}>
      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            justifyContent: 'center',
            padding: '100px',
          }}
        >
          <Spinner size="m" />
        </div>
      )}

      {!isLoading && (
        <>
          <Section 
          header='Referal system'
          
          >
          some info about ref system 

          <Button
          onClick={btnAddFriendHandler}
          >Пригласить </Button>
          </Section>

          

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
