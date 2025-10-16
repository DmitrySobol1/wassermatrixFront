import { Section, Cell } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import AddCardIcon from '@mui/icons-material/AddCard';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

import { TabbarMenu } from '@/components/TabbarMenu/TabbarMenu';
import { Page } from '@/components/Page';
import { useTexts } from '@/hooks/useTexts';
import { ROUTES } from '@/constants/routes';
import { ACCOUNT_STYLES } from '@/constants/styles';
import { TEXTS } from './texts';

export const MyAccount: FC = () => {
  const navigate = useNavigate();
  const {
    headerT,
    myOrdersT,
    settingsT,
    myPromocodesT,
    myCashbackT,
    referalSystemT,
  } = useTexts(TEXTS);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <Page back={false}>
      <Section header={headerT}>
        <Cell
          before={<LocalShippingIcon style={ACCOUNT_STYLES.icon} />}
          after={<Icon16Chevron />}
          onClick={() => handleNavigate(ROUTES.MY_ORDERS)}
        >
          {myOrdersT}
        </Cell>

        <Cell
          before={<LoyaltyIcon style={ACCOUNT_STYLES.icon} />}
          after={<Icon16Chevron />}
          onClick={() => handleNavigate(ROUTES.MY_PROMOCODES)}
        >
          {myPromocodesT}
        </Cell>

        <Cell
          before={<AddCardIcon style={ACCOUNT_STYLES.icon} />}
          after={<Icon16Chevron />}
          onClick={() => handleNavigate(ROUTES.MY_CASHBACK)}
        >
          {myCashbackT}
        </Cell>

        <Cell
          before={<GroupAddIcon style={ACCOUNT_STYLES.icon} />}
          after={<Icon16Chevron />}
          onClick={() => handleNavigate(ROUTES.REFERAL_SYSTEM)}
        >
          {referalSystemT}
        </Cell>

        <Cell
          before={<SettingsIcon style={ACCOUNT_STYLES.icon} />}
          after={<Icon16Chevron />}
          onClick={() => handleNavigate(ROUTES.SETTINGS)}
        >
          {settingsT}
        </Cell>
      </Section>

      <TabbarMenu />
    </Page>
  );
};
