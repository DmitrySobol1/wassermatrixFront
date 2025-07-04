import { Section, List, Cell, Divider,Spinner } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState,useContext} from 'react';
import { LanguageContext } from '../../components/App.tsx';

// import { settingsButton } from '@telegram-apps/sdk';

import {useTlgid} from '../../components/Tlgid'

import axios from '../../axios';

import styles from './payout.module.css'

import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';


import { TEXTS } from './texts.ts';

export const Payout1_listOfAvailable: FC = () => {
  const navigate = useNavigate();
    const { language } = useContext(LanguageContext);
    const [isLoading, setIsLoading] = useState(true);
  

 //FIXME:
   // @ts-ignore
   const {title} = TEXTS[language]; 

  
  const [balances, setBalances] = useState([]);

  
  const tlgid = useTlgid();
  
  // доступный баланс и монеты для вывода
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('/get_balance_for_pay_out', {
          params: {
            tlgid: tlgid,
          },
        });

    
        setBalances(response.data.arrayOfUserBalanceWithUsdPrice);
        setIsLoading(false)
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchCoins();
  }, []);

  function coinBtnHandler(coin: string, amount: number) {
    console.log('choosed coin=', coin);
    navigate('/payout_2writeadress-page', {
      state: {
        coin,
        amount,
      },
    });
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


          {!isLoading &&
          


      <List>
        <Section header={title}>
          

          {balances.map((coin: any) => (
            <>
              <Cell
                key={coin.currency}
                subtitle={`${coin.amount} ${coin.currency}`}
                after={<Icon16Chevron />}
                onClick={() => coinBtnHandler(coin.currency, coin.amount)}
              >
                <div className={styles.text}>{coin.currency}</div>
              </Cell>
              <Divider />
            </>
          ))}
        </Section>
      </List>
      }
    </Page>
  );
};
