import {
  Section,
  Spinner,
  Cell,
  Accordion,
  Button,
  Caption,
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
import AddCircleSharpIcon from '@mui/icons-material/AddCircleSharp';
import { AccordionSummary } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary';
import { AccordionContent } from '@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent';


import axios from '../../axios';



export const ReferalSystem: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);

  //@ts-ignore
  const { myPromocodesT, saleT, validUntilT, notPromocodeT, footerPromocodesT, copiedT,refMessageT} = TEXTS[language];

  const [isLoading, setIsLoading] = useState(false);
  const [referals, setReferals] = useState([]);
  const [infoAboutQuantity, setInfoAboutQuantity] = useState([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Получение списка рефералов и информации о количественных промокодах
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [referalsResponse, quantityInfoResponse] = await Promise.all([
          axios.get('/get_referals', {
            params: {
              father: tlgid,
              isSonEnterToApp: true
            }
          }),
          axios.get('/referals_promoForQuantity')
        ]);

        console.log('ref response= ', referalsResponse);
        console.log('quantity info response= ', quantityInfoResponse);

        if (referalsResponse.data.status === 'ok') {
          setReferals(referalsResponse.data.referals || []);
        }

        if (quantityInfoResponse.data) {
          setInfoAboutQuantity(quantityInfoResponse.data);
        }
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setReferals([]);
        setInfoAboutQuantity([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (tlgid) {
      fetchData();
    }
  }, [tlgid]);

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
    const msgtxt = refMessageT;
    
    //@ts-ignore
    const link = `https://telegram.me/wassermatrix_bot?start=${reflink}`;

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
          style={{marginBottom: 10}}
          >

           <Cell
              // before={<GroupAddIcon />}
              subtitle={
                <>
                <div>1) Промокоды за количество приглашенных</div>
                <div>2) Кешбек за покупки рефералов</div>
                </>
              }
            >
              Приглашайте рефералов и получайте:
            </Cell>
            
            

            <Button
            onClick={btnAddFriendHandler}
            style={{marginLeft: 20, marginBottom: 10}}
            >
               <div style={{display:'flex',gap: 5, alignItems: 'center' }}><AddCircleSharpIcon/> Пригласить друга</div>
            </Button>

          
          </Section>

          <Section
          header = 'Мои рефералы'
          style={{marginBottom: 10}}
          >

          {referals.length === 0 ? (
           

            <Accordion 
              expanded={isAccordionOpen} 
              onChange={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <AccordionSummary>
                Список рефералов (0 чел.):
              </AccordionSummary>
              
              <AccordionContent>
                  <Cell>
                    У вас пока нет рефералов
                  </Cell>
              </AccordionContent>
            </Accordion>
          ) : (
            <Accordion 
              expanded={isAccordionOpen} 
              onChange={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <AccordionSummary>
                Список рефералов ({referals.length} чел.)
              </AccordionSummary>
              
              <AccordionContent>
                {referals.map((referal: any, index: number) => (
                  <Cell key={index}>
                    {index+1}) {referal.username ? `username: ${referal.username}` : `telegram id: ${referal.son}`}
                  </Cell>
                ))}
              </AccordionContent>
            </Accordion>
          )}

          </Section>


          <Section
          header='Как работает реферальная система'
          style={{marginBottom: 100}}
          >

            
            <Accordion 
              expanded={isAccordionOpen} 
              onChange={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <AccordionSummary>
                Промокоды
              </AccordionSummary>
              <AccordionContent>
                {/* <Cell
                multiline>
                Чем больше людей пригласишь, тем выше будет промокод со скидкой
                </Cell> */}
                <Cell
                multiline
                style={{marginTop: 0}}
                >
                    <Caption
                                level="1"
                                weight="2"
                                // style={{marginLeft: 20}}
                              >
                    Чем больше людей пригласишь, тем выше будет промокод со скидкой
                    </Caption>
                {infoAboutQuantity.map((info: any, index: number) => (
                  
                  <div key={index}>
                    <div
                    // style={{marginLeft: 20}}
                    >
                      <Caption
                            level="1"
                            weight="3"
                          >
                          
                      {index+1}) за {info.qty} чел. - промокод на скидку -{info.sale}%
                      </Caption>
                      </div>
                  </div>
                  
                ))}
                </Cell>
              </AccordionContent>
            </Accordion>
          

              
          </Section>
          

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
