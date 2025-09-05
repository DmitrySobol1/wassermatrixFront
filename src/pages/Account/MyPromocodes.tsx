import {
  Section,
  Spinner,
  Cell,
  Snackbar,
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

export const MyPromocodes: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);

  //@ts-ignore
  const { myPromocodesT, saleT, validUntilT, notPromocodeT, footerPromocodesT, copiedT} = TEXTS[language];

  const [isLoading, setIsLoading] = useState(true);
  const [promocodes, setPromocodes] = useState<any[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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

  // Получаем промокоды пользователя
  useEffect(() => {
    const fetchPromocodes = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/user_get_personal_promocodes', {
          params: { tlgid }
        });

        if (response.data.status === 'ok') {
          setPromocodes(response.data.promocodes);
        }
      } catch (error) {
        console.error('Ошибка при получении промокодов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tlgid) {
      fetchPromocodes();
    }
  }, [tlgid]);

  // Функция копирования промокода в буфер обмена
  const copyToClipboard = async (promocode: string) => {
    try {
      await navigator.clipboard.writeText(promocode);
      setSnackbarMessage(copiedT);
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Ошибка копирования:', error);
      setSnackbarMessage('Ошибка копирования');
      setOpenSnackbar(true);
    }
  };

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
          header={myPromocodesT}
          footer={promocodes.length === 0 ? '': footerPromocodesT}
          >
            {promocodes.length === 0 ? (
              <Cell>{notPromocodeT}</Cell>
            ) : (
              promocodes.map((promocode) => {
                const expiryDate = new Date(promocode.expiryDate).toLocaleDateString();
                
                return (
                  <Cell
                    key={promocode._id}
                    multiline
                    subtitle={`${saleT} ${promocode.saleInPercent}% | ${validUntilT} ${expiryDate}`}
                    description={promocode[`description_users_${language}`] || promocode.description_users_en}
                    onClick={() => copyToClipboard(promocode.code)}
                    style={{ cursor: 'pointer' }}
                  >
                    {promocode.code}
                  </Cell>
                );
              })
            )}
          </Section>

          {openSnackbar && (
            <Snackbar duration={2000} onClose={() => setOpenSnackbar(false)}>
              {snackbarMessage}
            </Snackbar>
          )}

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
