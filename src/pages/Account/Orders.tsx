import {
  Section,
  Spinner,
  Cell,
  Text,
  List
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
// import { TEXTS } from './texts.ts';
import axios from '../../axios';

export const Orders: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  const { valute } = useContext(ValuteContext);
  const navigate = useNavigate();

  
  const [isLoading, setIsLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);

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

// для получения данных о моих заказах из БД OrdersModel
useEffect(() => {
  const fetchMyOrders = async () => {
    try {
      setIsLoading(true);
      // endpoint для получения информации, поиск заказов по tlgid
      const response = await axios.get(`/user_get_my_orders?tlgid=${tlgid}`);
      setMyOrders(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (tlgid) {
    fetchMyOrders();
  }
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
          <List>
            <Section header="Мои заказы">
              {myOrders && myOrders.length > 0 ? (
                myOrders.map((order: any) => {
                  // посчитать общую сумму заказа с учетом стоимости доставки
                  const totalSum = order.goods?.reduce((sum: number, item: any) => {
                    const itemPrice = Number(item.priceToShow) || 0;
                    const deliveryPrice = Number(item[`delivery_price_${order.regionDelivery}`]) || 0;
                    const quantity = Number(item.qty) || 0;
                    
                    return sum + ((itemPrice + deliveryPrice) * quantity);
                  }, 0) || 0;

                  return (
                    <Cell
                      key={order._id}
                      multiline
                      subtitle={`${totalSum.toFixed(2)} ${order.valuteToShow || valute} • ${order.country}`}
                     after={order.orderStatus?.[`name_${language}`]}
                    >
                      <Text weight="2">
                        Заказ от {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </Text>
                    </Cell>
                  );
                })
              ) : (
                <Cell>
                  <Text>У вас пока нет заказов</Text>
                </Cell>
              )}
            </Section>
          </List>

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};