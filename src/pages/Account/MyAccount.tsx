import { Section, Cell, Spinner } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useTlgid } from '../../components/Tlgid';

// import axios from '../../axios';

import { LanguageContext } from '../../components/App';
// import { ValuteContext } from '../../components/App';

import SettingsIcon from '@mui/icons-material/Settings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import AddCardIcon from '@mui/icons-material/AddCard';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { Page } from '@/components/Page.tsx';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

import { TEXTS } from './texts.ts';

// import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

export const MyAccount: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  //   const [isShowLanguageSelect, setShowLanguageSelect] = useState(false);
  //   const [isShowValuteSelect, setShowValuteSelect] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [isLoading] = useState(false);
  // const [userNPid, setUserNPid] = useState('');
  //   const [openSnakbar, setOpenSnakbar] = useState(false);
  //   const [textForSnak,setTextForSnak] = useState('')

  // const tlgid = useTlgid();

  //   const { language, setLanguage } = useContext(LanguageContext);
  //   const { valute, setValute } = useContext(ValuteContext);

  //   const [selectedLanguage, setSelectedLanguage] = useState(language);

  //FIXME:
  // @ts-ignore
  const { headerT, myOrdersT, settingsT, myPromocodesT, myCashbackT, referalSystemT} = TEXTS[language];

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
          <Section header={headerT}>
            <Cell
              before={<LocalShippingIcon style={{ color: '#168acd' }} />}
              // before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
              onClick={() => navigate('/myorders-page')}
            >
              {myOrdersT}
            </Cell>
            
            <Cell
              before={<LoyaltyIcon style={{ color: '#168acd' }} />}
              // before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
              onClick={() => navigate('/mypromocodes-page')}
            >
              {myPromocodesT}
            </Cell>
            
            <Cell
              before={<AddCardIcon style={{ color: '#168acd' }} />}
              // before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
              onClick={() => navigate('/mycashback-page')}
            >
              {myCashbackT}
            </Cell>
            
            <Cell
              before={<GroupAddIcon style={{ color: '#168acd' }} />}
              // before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
              onClick={() => navigate('/referalsystem-page')}
            >
              {referalSystemT}
            </Cell>

            <Cell
              // before={<Icon32ProfileColoredSquare />}
              before={<SettingsIcon style={{ color: '#168acd' }} />}
              after={<Icon16Chevron />}
              onClick={() => navigate('/setting-button-menu')}
            >
              {settingsT}
            </Cell>
          </Section>

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
