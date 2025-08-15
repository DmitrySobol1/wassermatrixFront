import {
  Section,
  Cell,
  List,
  Select,
  Spinner,
  Snackbar,
  Input
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useContext, useState, useEffect } from 'react';

import { useTlgid } from '../../components/Tlgid';

import axios from '../../axios';

import { LanguageContext } from '../../components/App';
import { ValuteContext } from '../../components/App';

import LanguageIcon from '@mui/icons-material/Language';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { Page } from '@/components/Page.tsx';

import { TEXTS } from './texts.ts';


export const SettingsButtonMenu: FC = () => {
  const [isShowLanguageSelect, setShowLanguageSelect] = useState(false);
  const [isShowValuteSelect, setShowValuteSelect] = useState(false);
  const [isShowPersonalSelect, setShowPersonalSelect] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [isLoading] = useState(false);
  // const [userNPid, setUserNPid] = useState('');
  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [textForSnak,setTextForSnak] = useState('')

  const tlgid = useTlgid();

  const { language, setLanguage } = useContext(LanguageContext);
  const { valute, setValute } = useContext(ValuteContext);

  const [selectedValute, setSelectedValute] = useState(valute);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // Состояния для данных пользователя
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    adress: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  //FIXME:
  // @ts-ignore
  const {title,languageT,valuteT, languageTsubtitle, valuteTsubtitle, languageChangedT,valuteChangedT, personalT, nameT, phoneT, addressT, setNameT, setPhoneT, setAddressT } = TEXTS[language];


  function showLanguageSelect() {
    setShowValuteSelect(false);
    setShowPersonalSelect(false);
    setShowLanguageSelect(!isShowLanguageSelect);
  }

  function showValuteSelect() {
    setShowLanguageSelect(false);
    setShowPersonalSelect(false);
    setShowValuteSelect(!isShowValuteSelect);
  }
  
  function showPersonalSelect() {
    setShowLanguageSelect(false);
    setShowValuteSelect(false);
    setShowPersonalSelect(!isShowPersonalSelect);
  }

  // Загрузка данных пользователя
  const fetchUserProfile = async () => {
    if (!tlgid) return;
    
    try {
      setIsLoadingProfile(true);
      const response = await axios.get(`/user_get_profile?tlgid=${tlgid}`);
      
      if (response.data.status === 'ok') {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Обновление данных пользователя
  const updateUserProfile = async (field: string, value: string) => {
    if (!tlgid) return;
    
    try {
      const updateData = {
        tlgid: tlgid,
        [field]: value
      };

      const response = await axios.post('/user_update_profile', updateData);
      
      if (response.data.status === 'ok') {
        setTextForSnak('Данные сохранены');
        setOpenSnakbar(true);
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setTextForSnak('Ошибка при сохранении');
      setOpenSnakbar(true);
    }
  };

  // Обработчики изменения полей
  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputBlur = (field: string, value: string) => {
    updateUserProfile(field, value);
  };

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    fetchUserProfile();
  }, [tlgid]);
  
  async function selectLanguageHandler(event: any) {
    setLanguage(event.target.value);
    setSelectedLanguage(event.target.value);
    console.log('set language=', event.target.value);

    const response = await axios.post('/change_language', {
      tlgid: tlgid,
      language: event.target.value,
    });

    if (response.data.status == 'ok'){
      //@ts-ignore
      setTextForSnak(TEXTS[event.target.value].languageChangedT)
      setOpenSnakbar(true)
    } 
    
  }

  async function selectValuteHandler(event: any) {
    setValute(event.target.value);
    setSelectedValute(event.target.value);
    console.log('set valute=', event.target.value);

    const response = await axios.post('/change_valute', {
      tlgid: tlgid,
      valute: event.target.value,
    });

    if (response.data.status === 'ok'){
      setTextForSnak(valuteChangedT)
      setOpenSnakbar(true)
    }
  }

 


  function snakHandler(){
  setOpenSnakbar(false)
  // setSpinBtn(false)
}


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
          <List>
            

            <Section header={title} style={{marginBottom:100}}>
              <div onClick={showLanguageSelect}>
                <Cell
                  before={<LanguageIcon />}
                  after={<ExpandMoreIcon />}
                >
                  {languageT}
                </Cell>
              </div>

              {isShowLanguageSelect && (
                <Select
                  header={languageTsubtitle}
                  onChange={selectLanguageHandler}
                  value={selectedLanguage}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="de">Deutch</option>
                </Select>
              )}

              <div onClick={showValuteSelect}>
                <Cell
                  before={<AccountBalanceIcon />}
                  after={<ExpandMoreIcon />}
                >
                  {valuteT}
                </Cell>
              </div>


              {isShowValuteSelect && (
                <Select
                  header={valuteTsubtitle}
                  onChange={selectValuteHandler}
                  value={selectedValute}
                >
                  <option value="₽">Рубль</option>
                  <option value="€">Euro</option>
                  <option value="$">US Dollar</option>
                </Select>
              )}
              
              <div onClick={showPersonalSelect}>
                <Cell
                  before={<PermContactCalendarIcon />}
                  after={<ExpandMoreIcon />}
                >
                  {personalT}
                </Cell>
              </div>
              
              {isShowPersonalSelect && (
                <>
                  {isLoadingProfile ? (
                    <Cell>
                      <Spinner size="s" /> Загрузка данных профиля...
                    </Cell>
                  ) : (
                    <>
                      <Input 
                        header={nameT}
                        value={userData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={(e) => handleInputBlur('name', e.target.value)}
                        placeholder={setNameT}
                      />
                      <Input 
                        header={phoneT}
                        value={userData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={(e) => handleInputBlur('phone', e.target.value)}
                        placeholder={setPhoneT}
                      />
                      <Input 
                        header={addressT}
                        value={userData.adress}
                        onChange={(e) => handleInputChange('adress', e.target.value)}
                        onBlur={(e) => handleInputBlur('adress', e.target.value)}
                        placeholder={setAddressT}
                      />
                    </>
                  )}
                </>
              )}

            </Section>
          </List>

           {openSnakbar && (
                  <Snackbar duration={1200} onClose={snakHandler}>
                    {textForSnak}
                  </Snackbar>
                )}    


          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
