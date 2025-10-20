import {
  Section,
  Cell,
  List,
  Select,
  Spinner,
  Snackbar,
  Input,
  IconButton
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTlgid } from '../../components/Tlgid';
import axios from '../../axios';
import { LanguageContext } from '../../components/App';
import { ValuteContext } from '../../components/App';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LanguageIcon from '@mui/icons-material/Language';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';

// ============================================================================
// Типы
// ============================================================================

type LanguageKey = 'ru' | 'en' | 'de';

type SectionType = 'language' | 'valute' | 'personal' | null;

interface TextsType {
  title: string;
  languageT: string;
  valuteT: string;
  languageTsubtitle: string;
  valuteTsubtitle: string;
  languageChangedT: string;
  valuteChangedT: string;
  personalT: string;
  nameT: string;
  phoneT: string;
  addressT: string;
  setNameT: string;
  setPhoneT: string;
  setAddressT: string;
  aboutT: string;
  errorT: string
}

interface UserData {
  name: string;
  phone: string;
  adress: string;
}

// ============================================================================
// Константы стилей
// ============================================================================

const ABOUT_TEXT_STYLE: React.CSSProperties = {
  color: '#1f8fcf',
  fontWeight: 500
};

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 100
};

// ============================================================================
// Основной компонент
// ============================================================================

export const SettingsButtonMenu: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();

  const { language, setLanguage } = useContext(LanguageContext);
  const { valute, setValute } = useContext(ValuteContext);

  // Состояние UI
  const [openSection, setOpenSection] = useState<SectionType>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [textForSnack, setTextForSnack] = useState('');

  // Состояние для локального отображения (до сохранения на сервере)
  const [selectedValute, setSelectedValute] = useState(valute);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // Состояния для данных пользователя
  const [userData, setUserData] = useState<UserData>({
    name: '',
    phone: '',
    adress: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Мемоизация текстов с fallback на английский
  const texts: TextsType = (TEXTS[language as LanguageKey] || TEXTS.en) as TextsType;
  const {
    title,
    languageT,
    valuteT,
    languageTsubtitle,
    valuteTsubtitle,
    valuteChangedT,
    personalT,
    nameT,
    phoneT,
    addressT,
    setNameT,
    setPhoneT,
    setAddressT,
    aboutT,
    errorT
  } = texts;

  // ============================================================================
  // Обработчики переключения секций
  // ============================================================================

  const toggleSection = useCallback((section: SectionType) => {
    setOpenSection(prev => prev === section ? null : section);
  }, []);

  // ============================================================================
  // API функции
  // ============================================================================

  // Загрузка данных пользователя
  const fetchUserProfile = useCallback(async () => {
    if (!tlgid) return;

    try {
      setIsLoadingProfile(true);
      const response = await axios.get(`/user_get_profile?tlgid=${tlgid}`);

      if (response.data.status === 'ok') {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setTextForSnack(errorT);
      setOpenSnackbar(true);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [tlgid]);

  // Обновление данных пользователя
  const updateUserProfile = useCallback(async (field: string, value: string) => {
    if (!tlgid) return;

    try {
      const updateData = {
        tlgid: tlgid,
        [field]: value
      };

      const response = await axios.post('/user_update_profile', updateData);

      if (response.data.status === 'ok') {
        setTextForSnack('Данные сохранены');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setTextForSnack(errorT);
      setOpenSnackbar(true);
    }
  }, [tlgid]);

  // ============================================================================
  // Обработчики изменения настроек
  // ============================================================================

  const selectLanguageHandler = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as LanguageKey;

    try {
      setLanguage(newLanguage);
      setSelectedLanguage(newLanguage);

      const response = await axios.post('/change_language', {
        tlgid: tlgid,
        language: newLanguage,
      });

      if (response.data.status === 'ok') {
        const successText = (TEXTS[newLanguage as LanguageKey] as TextsType).languageChangedT;
        setTextForSnack(successText);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Ошибка при изменении языка:', error);
      setSelectedLanguage(language);
      setTextForSnack(errorT);
      setOpenSnackbar(true);
    }
  }, [tlgid, setLanguage, language]);

  const selectValuteHandler = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValute = event.target.value;

    try {
      setValute(newValute);
      setSelectedValute(newValute);

      const response = await axios.post('/change_valute', {
        tlgid: tlgid,
        valute: newValute,
      });

      if (response.data.status === 'ok') {
        setTextForSnack(valuteChangedT);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Ошибка при изменении валюты:', error);
      setSelectedValute(valute);
      setTextForSnack(errorT);
      setOpenSnackbar(true);
    }
  }, [tlgid, setValute, valute, valuteChangedT]);

  // ============================================================================
  // Обработчики Input полей
  // ============================================================================

  const handleInputChange = useCallback((field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleInputBlur = useCallback((field: string, value: string) => {
    updateUserProfile(field, value);
  }, [updateUserProfile]);

  // Мемоизированные обработчики для каждого поля
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('name', e.target.value);
  }, [handleInputChange]);

  const handleNameBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleInputBlur('name', e.target.value);
  }, [handleInputBlur]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('phone', e.target.value);
  }, [handleInputChange]);

  const handlePhoneBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleInputBlur('phone', e.target.value);
  }, [handleInputBlur]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('adress', e.target.value);
  }, [handleInputChange]);

  const handleAddressBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleInputBlur('adress', e.target.value);
  }, [handleInputBlur]);

  // ============================================================================
  // Другие обработчики
  // ============================================================================

  const handleNavigateToOnboarding = useCallback(() => {
    navigate('/onboarding');
  }, [navigate]);

  const handleCloseSnackbar = useCallback(() => {
    setOpenSnackbar(false);
  }, []);

  const handleToggleLanguage = useCallback(() => {
    toggleSection('language');
  }, [toggleSection]);

  const handleToggleValute = useCallback(() => {
    toggleSection('valute');
  }, [toggleSection]);

  const handleTogglePersonal = useCallback(() => {
    toggleSection('personal');
  }, [toggleSection]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Page back={false}>
      <List>
        <div onClick={handleNavigateToOnboarding}>
          <Section>
            <Cell
              after={
                <IconButton mode="bezeled" size="s">
                  <HelpOutlineIcon />
                </IconButton>
              }
            >
              <span style={ABOUT_TEXT_STYLE}>{aboutT}</span>
            </Cell>
          </Section>
        </div>

        <Section header={title} style={SECTION_STYLE}>
          <div onClick={handleToggleLanguage}>
            <Cell before={<LanguageIcon />} after={<ExpandMoreIcon />}>
              {languageT}
            </Cell>
          </div>

          {openSection === 'language' && (
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

          <div onClick={handleToggleValute}>
            <Cell before={<AccountBalanceIcon />} after={<ExpandMoreIcon />}>
              {valuteT}
            </Cell>
          </div>

          {openSection === 'valute' && (
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

          <div onClick={handleTogglePersonal}>
            <Cell before={<PermContactCalendarIcon />} after={<ExpandMoreIcon />}>
              {personalT}
            </Cell>
          </div>

          {openSection === 'personal' && (
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
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    placeholder={setNameT}
                  />
                  <Input
                    header={phoneT}
                    value={userData.phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    placeholder={setPhoneT}
                  />
                  <Input
                    header={addressT}
                    value={userData.adress}
                    onChange={handleAddressChange}
                    onBlur={handleAddressBlur}
                    placeholder={setAddressT}
                  />
                </>
              )}
            </>
          )}
        </Section>
      </List>

      {openSnackbar && (
        <Snackbar duration={1200} onClose={handleCloseSnackbar}>
          {textForSnack}
        </Snackbar>
      )}

      <TabbarMenu />
    </Page>
  );
};
