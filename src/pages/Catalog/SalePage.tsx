import {
  Cell,
  Button,
  Section,
  Spinner,
  Banner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
// import React from 'react';
import axios from '../../axios';

import { useNavigate } from 'react-router-dom';

import { useContext, useEffect, useState } from 'react';
// import { useContext, useEffect, useState, useRef } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { TotalBalanceContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';

// import { useLocation } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';
// import { useLocation, useNavigate } from 'react-router-dom';

// import { settingsButton } from '@telegram-apps/sdk-react';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import { useTlgid } from '../../components/Tlgid';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

// import { Icon28CloseAmbient } from '@telegram-apps/telegram-ui/dist/icons/28/close_ambient';

import { TEXTS } from './texts.ts';

// import payin from '../../img/payin.png';
// import payout from '../../img/payout.png';
// import changebetweenusers from '../../img/changebetweenusers.png';

export const SalePage: FC = () => {
  //FIXME:
  // const tlgid = useTlgid();
  // const tlgid = 412697670;

  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);

     const navigate = useNavigate();
  // const location = useLocation();
  // const { itemid } = location.state || {};

  // const [goodInfo, setGoodInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saleInfo, setSaleInfo] = useState<any>(null);

  const domen = import.meta.env.VITE_DOMEN;

  //@ts-ignore
  const { addToCartT, itemAdded } = TEXTS[language];


  // получить данные об акции
  useEffect(() => {
    const fetchSaleInfo = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/get_sale_info');

        console.log('SALE INFO', response.data);

        if (response.data.status === 'ok') {
          setSaleInfo(response.data.sale);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных об акции:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaleInfo();
  }, []);

 function goToOnePageHandler(id:any){

   navigate('/onegood-page', {
     state: {
       itemid: id,
      },
    })
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
            <Section style={{ marginBottom: 100 }}>
                <Banner
                                  // здесь выводить данные из поля file
                                  background={
                                    saleInfo?.file?.url ? 
                                    <img alt="Sale banner" src={`${domen}${saleInfo.file.url}`} 
                                    // style={{width: '150%'}} 
                                    style={{
                                              display: 'block',
                                              height: 'auto',
                                              objectFit: 'cover',
                                              width: '100%',
                                              objectPosition: 'center'
                                        }}
                                    /> :
                                    <img alt="Default banner" src="https://www.nasa.gov/wp-content/uploads/2023/10/streams.jpg?resize=1536,864" style={{width: '150%'}} />
                                  }
                                  // здесь выводить данные из поля title 
                                  header={saleInfo?.[`title_${language}`] || "Акция"}
                                  // здесь выводить данные из поля subtitle
                                  subheader={saleInfo?.[`subtitle_${language}`] || "Скидка на товар - 20%"}
                                  type="inline"
                                >
                                  <Cell>
                                    {''}
                                    
                                  </Cell>
                                  
                    </Banner>

                    {/* здесь выводить данные из поля dateUntil */}
                    {saleInfo?.dateUntil && (
                      <Cell>Акция действует до: {saleInfo.dateUntil}</Cell>
                    )}
                    {/* здесь выводить данные из поля info */}
                    {saleInfo?.[`info_${language}`] && (
                      <Cell multiline>{saleInfo[`info_${language}`]}</Cell>
                    )}


                    { saleInfo.isShowButton &&

                      
                      <Section style={{ marginBottom: 100, padding: 10 }}>
                        <Button
                      onClick={ ()=>goToOnePageHandler(saleInfo.good._id)}
                      stretched
                      >
                        {saleInfo?.[`buttonText_${language}`] || 'Перейти к товару'}
                      </Button>
                      </Section>  
                    }

                    
            </Section>

        

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
