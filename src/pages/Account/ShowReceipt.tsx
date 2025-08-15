// import {
//   Section,
//   Spinner,
//   Cell,
  
// } from '@telegram-apps/telegram-ui';
// import type { FC } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useEffect, useState, useContext } from 'react';
// import { LanguageContext } from '../../components/App.tsx';
// // import { ValuteContext } from '../../components/App.tsx';
// import { settingsButton } from '@telegram-apps/sdk-react';
// import { useTlgid } from '../../components/Tlgid.tsx';
// import { Page } from '@/components/Page.tsx';
// // import { TEXTS } from './texts.ts';

// export const ShowReceipt: FC = () => {
//   const tlgid = useTlgid();
//   const { language } = useContext(LanguageContext);
//   // const { valute } = useContext(ValuteContext);

//   const [isLoading, setIsLoading] = useState(true);
 
//   const navigate = useNavigate();
   

//   if (settingsButton.mount.isAvailable()) {
//     settingsButton.mount();
//     settingsButton.isMounted();
//     settingsButton.show();
//   }

//   if (settingsButton.onClick.isAvailable()) {
//     function listener() {
//       console.log('Clicked!');
//       navigate('/setting-button-menu');
//     }
//     settingsButton.onClick(listener);
//   }

//   // для получения данных о моих заказах из БД OrdersModel
//   useEffect(() => {
   
//     const fetchMyOrders = async () => {
//       try {
//         setIsLoading(true);
       
//       } catch (error) {
//         console.error('Ошибка при загрузке заказов:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (tlgid) {
//       fetchMyOrders();
//     }
//   }, [tlgid]);

//   return (
//     <Page back={true}>
//       {isLoading && (
//         <div
//           style={{
//             textAlign: 'center',
//             justifyContent: 'center',
//             padding: '100px',
//           }}
//         >
//           <Spinner size="m" />
//         </div>
//       )}

//       {!isLoading && (
//         <>
//             <Section header="Чек" style={{ marginBottom: 100 }}>
//                 <Cell>Тут чек</Cell>
//             </Section>

          
//         </>
//       )}
//     </Page>
//   );
// };
