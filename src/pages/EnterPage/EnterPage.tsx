import { Section, List, Cell} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect,useContext, useState} from 'react';
// import { useNavigate } from 'react-router-dom';

import axios from '../../axios';

import { LanguageContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';


import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import {useMemo } from 'react';
// import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';


export const EnterPage: FC = () => {
  // const navigate = useNavigate();
  
   

    const { setLanguage } = useContext(LanguageContext);
    const { setValute } = useContext(ValuteContext);

    const [jbid, setJbid]=useState('')
  
   //FIXME:
  // const tlgid = useTlgid();
  // const tlgid = 412697670;
  const tlgid = 777;



const lp = useMemo(() => retrieveLaunchParams(), []);
{/* <DisplayData>
  { title: 'tgWebAppStartParam', value: lp.tgWebAppStartParam },
</DisplayData> */}

//@ts-ignore
setJbid(lp.tgWebAppStartParam)

  // для рендера
  useEffect(() => {

    axios
      .post('/enter', {
        tlgid: tlgid,
        jbid: jbid
      })
      .then((response) => {
        if (response.data.userData.result === 'showOnboarding') {
          
          // const nowpaymentid = response.data.userData.nowpaymentid;
          console.log('showOnboarding');
          // navigate('/onboarding');
        } else if (response.data.userData.result === 'showCatalogPage') {
          console.log(response.data.userData);
          setLanguage(response.data.userData.language)
          setValute(response.data.userData.valute)
          // navigate('/catalog-page')  
        }
      })
      .catch((error) => {
        console.error('Ошибка при выполнении запроса:', error);
      })
      .finally(() => {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      });
  }, []);

  return (
    <Page>
      <List>
        <Section>EnterPage</Section>
        <Cell>jbid = {jbid} </Cell>
      </List>
    </Page>
  );
};
