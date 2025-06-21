import { Section, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect,useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from '../../axios';

import { LanguageContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const EnterPage: FC = () => {
  const navigate = useNavigate();
  
   

    const { setLanguage } = useContext(LanguageContext);
      const { setValute } = useContext(ValuteContext);
  
   //FIXME:
  // const tlgid = useTlgid();
  const tlgid = 412697670;

  // для рендера
  useEffect(() => {

    axios
      .post('/enter', {
        tlgid: tlgid,
      })
      .then((response) => {
        if (response.data.userData.result === 'showOnboarding') {
          console.log('showOnboarding');

          // const nowpaymentid = response.data.userData.nowpaymentid;

          navigate('/onboarding', 
          //   {
          //   state: {
          //     nowpaymentid: nowpaymentid,
          //   },
          // }
        );
          // navigate('/onboarding');
        } else if (response.data.userData.result === 'showCatalogPage') {
          console.log(response.data.userData);
          setLanguage(response.data.userData.language)
          setValute(response.data.userData.valute)
          navigate('/catalog-page')  
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
      </List>
    </Page>
  );
};
