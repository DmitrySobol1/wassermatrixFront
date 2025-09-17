import {
  Section,
  Spinner,
  Cell,
  Accordion,
  Button,
  Subheadline,
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
  const { myPromocodesT, saleT, validUntilT, notPromocodeT, footerPromocodesT, copiedT,refMessageT, referalSystemT, refInfoHeaderT, refInfoText1T,refInfoText2T,inviteBtnT, myReferalsT, listReferalsT, personT, noRefT, howRefWorksT,quantityRefT, zaT, za2T, getCbT, myCashbackT, purchasedT, refInfoText3T} = TEXTS[language];

  const [isLoading, setIsLoading] = useState(false);
  const [referals, setReferals] = useState([]);
  const [infoAboutQuantity, setInfoAboutQuantity] = useState([]);
  const [infoAboutPurchase, setInfoAboutPurchase] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Функция для управления аккордеонами (только один может быть открыт)
  const handleAccordionChange = (accordionId: string) => {
    setOpenAccordion(openAccordion === accordionId ? null : accordionId);
  };

  // Получение списка рефералов и информации о количественных промокодах
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [referalsResponse, quantityInfoResponse, purchaseInfoResponse] = await Promise.all([
          axios.get('/get_referals', {
            params: {
              father: tlgid,
              isSonEnterToApp: true
            }
          }),
          axios.get('/referals_promoForQuantity'),
          axios.get('/referals_promoForPurchase')
        ]);

        console.log('ref response= ', referalsResponse);
        console.log('quantity info response= ', quantityInfoResponse);
        console.log('purchase InfoResponse= ', purchaseInfoResponse);

        if (referalsResponse.data.status === 'ok') {
          setReferals(referalsResponse.data.referals || []);
        }

        if (quantityInfoResponse.data) {
          setInfoAboutQuantity(quantityInfoResponse.data);
        }

        if (purchaseInfoResponse.data) {
          setInfoAboutPurchase(purchaseInfoResponse.data[0].sale)

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
    reflink = reflink + language

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
          header={referalSystemT}
          style={{marginBottom: 10}}
          >

           <Cell
              multiline
              subtitle={
                <>
                <div>1) {refInfoText1T}</div>
                <div>2) {refInfoText2T}</div>
                </>
              }
            >
              {refInfoHeaderT}
            </Cell>
            
            

            <Button
            onClick={btnAddFriendHandler}
            style={{marginLeft: 20, marginBottom: 10}}
            >
               <div style={{display:'flex',gap: 5, alignItems: 'center' }}><AddCircleSharpIcon/> {inviteBtnT}</div>
            </Button>

          
          </Section>

          <Section
          header = {myReferalsT}
          style={{marginBottom: 10}}
          >

          {referals.length === 0 ? (
           

            <Accordion
              expanded={openAccordion === 'referals'}
              onChange={() => handleAccordionChange('referals')}
            >
              <AccordionSummary>
                {listReferalsT} (0 {personT}):
              </AccordionSummary>
              
              <AccordionContent>
                  <Cell multiline>
                    {noRefT}
                  </Cell>
              </AccordionContent>
            </Accordion>
          ) : (
            <Accordion
              expanded={openAccordion === 'referals'}
              onChange={() => handleAccordionChange('referals')}
            >
              <AccordionSummary>
                {listReferalsT} ({referals.length} {personT})
              </AccordionSummary>
              
              <AccordionContent>
                <Cell>

                {referals.map((referal: any, index: number) => (

                    

                    <div key={index}>
                      <Subheadline 
                      level="1"
                          weight="3"
                      > 
                          {index+1}) {referal.username ? `username: ${referal.username}` : `telegram id: ${referal.son}`}
                      
                      </Subheadline>
                      </div>
                    
                  ))}
                  </Cell>
              </AccordionContent>
            </Accordion>
          )}

          </Section>


          <Section
          header={howRefWorksT}
          style={{marginBottom: 100}}
          >

            
            <Accordion
              expanded={openAccordion === 'promocodes'}
              onChange={() => handleAccordionChange('promocodes')}
            >
              <AccordionSummary>
                {refInfoText3T}
              </AccordionSummary>
              <AccordionContent>
                
                <Cell
                multiline
                style={{marginTop: 0}}
                >
                    <Subheadline
                                level="1"
                                weight="3"
                                // style={{marginLeft: 20}}
                              >
                        {quantityRefT}  
                    </Subheadline>
                {infoAboutQuantity.map((info: any, index: number) => (
                  
                  <div key={index}>
                    <div
                    // style={{marginLeft: 20}}
                    >
                      <Subheadline
                            level="1"
                            weight="3"
                          >
                          
                      {index+1}) {zaT} {info.qty} {za2T} -{info.sale}%
                      </Subheadline>
                      </div>
                  </div>
                  
                ))}
                </Cell>
              </AccordionContent>
            </Accordion>

            <Accordion
              expanded={openAccordion === 'cashback'}
              onChange={() => handleAccordionChange('cashback')}
            >
              <AccordionSummary>
                {refInfoText2T}
              </AccordionSummary>
              <AccordionContent>
                
                <Cell
                multiline
                style={{marginTop: 0}}
                >
                    <div>
                    <Subheadline
                                level="1"
                                weight="3"
                                // style={{marginLeft: 20}}
                              >
                    
                    {getCbT}
                    </Subheadline>
                    </div>
                  <div>
                      <Subheadline
                            level="1"
                            weight="3"
                          >
                          {myCashbackT} = {infoAboutPurchase}% {purchasedT}
                      
                      </Subheadline>
                      </div>
                      
                  
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
