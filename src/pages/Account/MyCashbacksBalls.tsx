import {
  Section,
  Spinner,
  Cell,
  Accordion,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import axios from '../../axios';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';

export const MyCashbacksBalls: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);

  //@ts-ignore
  const {myPromocodesT,saleT,validUntilT,notPromocodeT,footerPromocodesT,copiedT,myInfoT, purchaseQtyT, pcsT, purchaseSumT, clientCashbackLevelT, deltaToNextLevelT, maxLevelT,levelT,totalSumT,fromPurchaseT, cashbackSystemT, cashbackBallT} = TEXTS[language];

  const [isLoading, setIsLoading] = useState(true);

  // Новые состояния для кэшбека
  const [purchaseQty, setPurchaseQty] = useState(0);
  const [purchaseSum, setPurchaseSum] = useState(0);
  const [clientCashbackLevel, setClientCashbackLevel] = useState('');
  const [deltaToNextLevel, setDeltaToNextLevel] = useState(0);
  const [cashbackLevels, setCashbackLevels] = useState<any[]>([]);
  const [currentPercent, setCurrentPercent] = useState('');
  const [userValute, setUserValute] = useState('EUR');
  const [cashbackBall, setCashbackBall] = useState(0);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

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

  // Загружаем данные о покупках и уровнях кэшбека
  useEffect(() => {
    const fetchCashbackData = async () => {
      if (!tlgid) return;

      setIsLoading(true);
      try {
        // 1. Получаем заказы клиента с payStatus = true
        const ordersResponse = await axios.get('/user_get_orders', {
          params: { tlgid, payStatus: true },
        });

        console.log('Orders data:', ordersResponse.data);
        const responseData = ordersResponse.data;

        // 2. Используем данные, рассчитанные в backend
        setCashbackBall(responseData.cashbackBall);
        setPurchaseQty(responseData.purchaseQty || 0);
        setPurchaseSum(responseData.totalSumInUserCurrency);
        setUserValute(responseData.valute);
        setClientCashbackLevel(responseData.currentCashbackLevel);
        setDeltaToNextLevel(responseData.deltaToNextLevelInUserCurrency);
        setCurrentPercent(responseData.currentPercent);

        setCashbackLevels(responseData.sortedLevelsUserCurrency);
      } catch (error) {
        console.error('Error fetching cashback data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashbackData();
  }, [tlgid]);

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
          header={myInfoT}
          style={{marginBottom: 10}}
          >
            <Cell after={`${cashbackBall} ${userValute}`}>{cashbackBallT}</Cell>
            <Cell after={`${purchaseQty} ${pcsT}`}>{purchaseQtyT}</Cell>
            <Cell after={`${purchaseSum} ${userValute}`}>{purchaseSumT}</Cell>
            <Cell after={`${clientCashbackLevel} (${currentPercent}%)`}>
              {clientCashbackLevelT}
            </Cell>
            <Cell
              after={
                deltaToNextLevel > 0
                  ? `${deltaToNextLevel} ${userValute}`
                  : maxLevelT
              }
            >
              {deltaToNextLevelT}
            </Cell>
          </Section>

          {/* <Section header={cashbackSystemT}>
            {cashbackLevels.map((level: any, index: number) => (
              <Cell
                key={level._id || index}
                subtitle={`${totalSumT} ${level.sum} ${userValute}`}
              >
                {levelT} {level.position} - {level.percent}% {fromPurchaseT}
              </Cell>
            ))}
          </Section> */}

          
          <Section 
          header="Как работает система кешбека" 
          style={{ marginBottom: 100 }}>
            <Accordion
              
              expanded={isAccordionOpen}
              onChange={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <AccordionSummary>Уровни кешбека</AccordionSummary>
              <AccordionContent>
                <Cell
                multiline
                >
                  За ваши покупки вам начисляются баллы кешбека, которыми можно оплачивать дальнейшие покупки. Чем больше общая сумма всех покупок - тем выше процент кешбека:
                </Cell>
                {cashbackLevels.map((level: any, index: number) => (
                  <Cell
                    key={level._id || index}
                    subtitle={`${totalSumT} ${level.sum} ${userValute}`}
                  >
                    {levelT} {level.position} - {level.percent}% {fromPurchaseT}
                  </Cell>
                ))}
              </AccordionContent>
            </Accordion>
          </Section>

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
