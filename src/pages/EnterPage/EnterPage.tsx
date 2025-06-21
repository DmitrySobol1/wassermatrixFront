import { Section, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from '../../axios';

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const EnterPage: FC = () => {
  const navigate = useNavigate();

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
          // console.log('showWalletPage');
          // const nowpaymentid = response.data.userData.nowpaymentid;
          // // console.log('!!!!!!!nowpaymentid=',nowpaymentid)
          navigate(
            '/catalog-page'
            // {
            // state: {
            //   nowpaymentid: nowpaymentid,
            // },
            // }
          );
          // navigate('/wallet-page');
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
