import { Section, List} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect,useContext} from 'react';
import { useNavigate } from 'react-router-dom';

import axios from '../../axios';

import { LanguageContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';

import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';


import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import {useMemo } from 'react';
// import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';


export const EnterPage: FC = () => {
  const navigate = useNavigate();
  
   

    const { setLanguage } = useContext(LanguageContext);
    const { setValute } = useContext(ValuteContext);

   //FIXME:
  const tlgid = useTlgid();



const lp = useMemo(() => retrieveLaunchParams(), []);



  // для рендера
  useEffect(() => {
    const jbidValue = lp.start || 111 ;
    const langFromBot = lp.langfrombot || 'de'
    
    // console.log('jbid=', jbidValue);
    // console.log('langFromBot=', langFromBot);


    axios
      .post('/enter', {  
        tlgid: tlgid,
        jbid: jbidValue,
        language: langFromBot 
      })
      .then((response) => {
        if (response.data.userData.result === 'showOnboarding') {

          console.log('lang from back=', response.data.userData.language )
          // return

          setLanguage(response.data.userData.language)
          navigate('/onboarding');
        } else if (response.data.userData.result === 'showCatalogPage') {
          setLanguage(response.data.userData.language)
          setValute(response.data.userData.valute)
          navigate('/catalog-page')  
        }
      })
      .catch((error) => {
        console.error('❌ Ошибка при выполнении запроса:', error);
        console.error('❌ Failed jbid value was:', jbidValue);
      })
      .finally(() => {
        
      });
  }, []);

  return (
    <Page>
      <List>
        <Section>EnterPage</Section>
        {/* <Cell>jbid = {jbid} </Cell> */}
      </List>
    </Page>
  );
};
