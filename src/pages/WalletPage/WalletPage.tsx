import {
  Section,
  Cell,
  List,
  Tappable,
  Divider,
  TabsList,
  Spinner,
  Tooltip,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import axios from '../../axios';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useRef } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TotalBalanceContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';

import { useLocation } from 'react-router-dom';

import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

import styles from './walletpage.module.css';
import { TEXTS } from './texts.ts';

import payin from '../../img/payin.png';
import payout from '../../img/payout.png';
import changebetweenusers from '../../img/changebetweenusers.png';

export const WalletPage: FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(LanguageContext);
  const { balance, setBalance } = useContext(TotalBalanceContext);
  const { valute, setValute } = useContext(ValuteContext);

  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTextBalanceZero, setShowTextBalanceZero] = useState(false);

  const buttonRef = useRef(null);

  const location = useLocation();
  const { nowpaymentid } = location.state || {};

  //FIXME:
  //  @ts-ignore
  const {
    under_balance,
    pay_in,
    pay_out,
    transfer,
    my_actives,
    payin_history,
    payout_history,
    one_payin,
    one_transfer,
    one_payout,
    one_exchange,
    textBalanceZero,
    noPay,
    //  @ts-ignore
  } = TEXTS[language];

  if (settingsButton.mount.isAvailable()) {
    settingsButton.mount();
    settingsButton.isMounted(); // true
    settingsButton.show();
  }

  if (settingsButton.onClick.isAvailable()) {
    function listener() {
      console.log('Clicked!');
      navigate('/setting-button-menu');
    }
    settingsButton.onClick(listener);
  }


  //FIXME: 
  // const tlgid = useTlgid();
  const tlgid = 412697670

  // для вывода баланса, языка, валюты
  useEffect(() => {
    // TODO: можно пост на гет испправить, т.к. получаем инфо

    const fetchUserInfo = async () => {
      try {
        const response = await axios.post('/get_user_balance', {
          tlgid: tlgid,
        });

        console.log('DATA=', response.data);

        setLanguage(response.data.language);
        setBalance(response.data.balance);
        setValute(response.data.valute);
        setSymbol(response.data.symbol);

        // для настройки фронта
        // setLanguage('ru');
        // setBalance(0);
        // setValute('rub');
        // setSymbol('р');

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        // setShowLoader(false);
        // setWolfButtonActive(true);
      }
    };

    fetchUserInfo();
  }, []);

  function payInBtnHandler() {
    navigate('/payin-page');
  }

  function openSettings() {
    navigate('/setting-button-menu');
  }

  function payOutBtnHandler() {
    if (balance === 0) {
      console.log('баланс = 0');

      setShowTextBalanceZero(true);

      setTimeout(() => setShowTextBalanceZero(false), 2000);
    } else {
      console.log('баланс норм');
      navigate('/payout_1availablelist-page');
    }
  }

  function transferBtnHandler() {
    if (balance === 0) {
      console.log('баланс = 0');

      setShowTextBalanceZero(true);

      setTimeout(() => setShowTextBalanceZero(false), 2000);
    } else {
      console.log('баланс норм');
      navigate('/transfer_1availablelist-page');
    }
  }

  const [selectedTab, setSelectedTab] = useState('tab1');
  const options = [
    { id: 'tab1', label: my_actives },
    { id: 'tab2', label: payin_history },
    { id: 'tab3', label: payout_history },
  ];

  function segmentBtnHandler(id: string) {
    setSelectedTab(id);
  }

  // вывод активов
  const [balances, setBalances] = useState([]);

  if (nowpaymentid != 0) {
    useEffect(() => {
      const fetchBalances = async () => {
        try {
          const response = await axios.get('/get_balance_for_pay_out', {
            params: {
              tlgid: tlgid,
            },
          });

          setBalances(response.data.arrayOfUserBalanceWithUsdPrice);
          console.log('BALANCES', response.data.arrayOfUserBalanceWithUsdPrice);
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        } finally {
          // setShowLoader(false);
          // setWolfButtonActive(true);
        }
      };

      fetchBalances();
    }, []);
  }

  // вывод "мои пополнения"
  const [myPayIns, setMyPayIns] = useState([]);

  if (nowpaymentid != 0) {
    useEffect(() => {
      const fetchGetMyPayIns = async () => {
        try {
          const response = await axios.get('/get_my_payin', {
            params: {
              tlgid: tlgid,
            },
          });

          console.log('payins=', response.data);
          if (response.data.status === 'ok') {
            setMyPayIns(response.data.data);
          } else if (response.data.status === 'no') {
            const newItem = { type: 'no' };
            //FIXME:
            //  @ts-ignore
            setMyPayIns([newItem]);
          }
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        } finally {
          // setShowLoader(false);
          // setWolfButtonActive(true);
        }
      };

      fetchGetMyPayIns();
    }, []);
  }

  // вывод "мои выводы"
  const [myPayOuts, setMyPayOuts] = useState([]);

  if (nowpaymentid != 0) {
    useEffect(() => {
      const fetchGetMyPayOuts = async () => {
        try {
          const response = await axios.get('/get_my_payout', {
            params: {
              tlgid: tlgid,
            },
          });

          console.log('payout=', response.data);
          if (response.data.status === 'ok') {
            setMyPayOuts(response.data.data);
          } else if (response.data.status === 'no') {
            const newItem = { type: 'no' };
            //FIXME:
            //  @ts-ignore
            setMyPayOuts([newItem]);
          }
        } catch (error) {
          console.error('Ошибка при выполнении запроса:', error);
        } finally {
          // setShowLoader(false);
          // setWolfButtonActive(true);
        }
      };

      fetchGetMyPayOuts();
    }, []);
  }

  const typeMap = {
    payin: one_payin,
    payout: one_payout,
    transfer: one_transfer,
    no: noPay,
    exchange: one_exchange,
  } as const;

  return (
    <Page back={false}>
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
          <List>
            <Section>
              <Cell className={styles.cell}>
                <div className={styles.balancePartWrapper}>
                  <div className={styles.textBalanceWrapper}>
                    <div className={styles.balanceText}>
                      <span className={styles.symbol}>{symbol}</span> {balance}
                    </div>
                  </div>

                  <div className={styles.textBalanceWrapper}>
                    <div className={styles.textUnderBalance}>
                      {under_balance}{' '}
                      <Tappable
                        Component="span"
                        className={styles.valuteText}
                        onClick={openSettings}
                      >
                        {valute}
                      </Tappable>
                    </div>
                  </div>
                </div>
              </Cell>

              {/* <Link to="/init-data">
            <Cell subtitle={text}>
              lang={language} баланс={balance} валюта={valute}
            </Cell>
          </Link> */}

              <Cell className={styles.cell}>
                <div className={styles.wrapperAllButtons}>
                  {/* пополнить */}
                  <Tappable
                    Component="span"
                    // className={styles.valuteText}
                    onClick={payInBtnHandler}
                  >
                    <div className={styles.wrapperOneButton}>
                      <img src={payin} className={styles.imgBtn} />
                      <div className={styles.textForButton}>{pay_in}</div>
                    </div>
                  </Tappable>

                  {/* вывести */}
                  <Tappable
                    Component="span"
                    // className={styles.valuteText}
                    onClick={payOutBtnHandler}
                    ref={buttonRef}
                  >
                    <div className={styles.wrapperOneButton}>
                      <img src={payout} className={styles.imgBtn} />
                      <div className={styles.textForButton}>{pay_out}</div>
                    </div>
                  </Tappable>

                  {/* трансфер  */}
                  <Tappable
                    Component="span"
                    // className={styles.valuteText}
                    onClick={transferBtnHandler}
                    // ref={buttonRef}
                  >
                    <div className={styles.wrapperOneButton}>
                      <img src={changebetweenusers} className={styles.imgBtn} />
                      <div className={styles.textForButton}>{transfer}</div>
                    </div>
                  </Tappable>
                </div>
              </Cell>

              {showTextBalanceZero && (
                <Tooltip mode="light" targetRef={buttonRef} withArrow={false}>
                  {textBalanceZero}
                </Tooltip>
              )}
            </Section>

            <Section>
              <TabsList>
                {options.map((option) => (
                  <TabsList.Item
                    key={option.id}
                    selected={selectedTab === option.id}
                    onClick={() => segmentBtnHandler(option.id)}
                  >
                    {option.label}
                  </TabsList.Item>
                ))}
              </TabsList>

              {selectedTab === 'tab1' && (
                <>
                  {balances.map((coin: any) => (
                    <>
                      <Cell
                        key={coin.currency}
                        subtitle={`${coin.amount}  ${coin.currency}`}
                        after={
                          <Cell>
                            {coin.priceAllCoinInUserFiat} {coin.symbol}
                          </Cell>
                        }
                        className={styles.activiText}
                      >
                        {coin.currency}
                      </Cell>
                      <Divider />
                    </>
                  ))}
                </>
              )}

              {selectedTab === 'tab2' && (
                <>
                  {myPayIns.map((item: any) => (
                    <>
                      <Cell
                        key={item.currency}
                        subtitle={item.formattedDate}
                        after={
                          <Cell className={styles.payinText}>
                            {item.type != 'no' && '+'} {item.qty} {item.coin}
                          </Cell>
                        }
                      >
                        {typeMap[item.type as keyof typeof typeMap]}
                      </Cell>
                      <Divider />
                    </>
                  ))}
                </>
              )}

              {selectedTab === 'tab3' && (
                <>
                  {myPayOuts.map((item: any) => (
                    <>
                      <Cell
                        key={item.currency}
                        subtitle={item.formattedDate}
                        after={
                          <Cell className={styles.payoutText}>
                            {item.type != 'no' && '-'} {item.qty} {item.coin}
                          </Cell>
                        }
                      >
                        {typeMap[item.type as keyof typeof typeMap]}
                      </Cell>
                      <Divider />
                    </>
                  ))}
                </>
              )}
            </Section>
          </List>
          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
