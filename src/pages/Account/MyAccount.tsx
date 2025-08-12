import {
  Section,
  Cell,
  Spinner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useTlgid } from '../../components/Tlgid';

// import axios from '../../axios';

// import { LanguageContext } from '../../components/App';
// import { ValuteContext } from '../../components/App';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { Page } from '@/components/Page.tsx';
import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

// import { TEXTS } from './texts.ts';

// import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
// import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

export const MyAccount: FC = () => {
    const navigate = useNavigate();
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
  //   const {title,languageT,valuteT, languageTsubtitle, valuteTsubtitle, languageChangedT,valuteChangedT } = TEXTS[language];

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
          <Section header="Мой аккаунт">
            <Cell
              before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
              onClick={()=> navigate('/myorders-page')}
            >
              Мои заказы
            </Cell>

            <Cell
              before={<Icon32ProfileColoredSquare />}
              after={<Icon16Chevron />}
              onClick={()=> navigate('/setting-button-menu')}
            >
              Настройки
            </Cell>
          </Section>

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
