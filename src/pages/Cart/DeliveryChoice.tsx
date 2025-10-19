import {
  Section,
  Snackbar,
  Spinner,
  Button,
  Select,
  Tappable,
  Input,
  Cell,
  Text
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import axios from '../../axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext, useCallback, useMemo, useRef } from 'react';
import { LanguageContext } from '../../components/App.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';
import { useSettingsButton } from '@/hooks/useSettingsButton';

// ============= ТИПЫ =============
interface Country {
  _id: string;
  name_en: string;
  name_ru?: string;
  name_de?: string;
  isEU: boolean;
}

interface CartItem {
  id: string;
  name_ru?: string;
  name_en?: string;
  name_de?: string;
  deliveryPriceToShow_de?: string;
  deliveryPriceToShow_inEu?: string;
  deliveryPriceToShow_outEu?: string;
  qty: number;
  valuteToShow: string;
}

type DeliveryRegion = 'de' | 'inEu' | 'outEu';

interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: 'error' | 'success';
}

interface DeliveryPriceItem {
  id: string;
  name: string;
  price: string;
  valute: string;
}

// ============= КОНСТАНТЫ =============
const SPINNER_CONTAINER_STYLE: React.CSSProperties = {
  textAlign: 'center',
  justifyContent: 'center',
  padding: '100px',
};

const ICON_CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex'
};

const DEBOUNCE_DELAY = 500;

const ERROR_MESSAGE_STYLE: React.CSSProperties = {
  color: 'red',
  marginBottom: '10px',
};

// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============
const isGermany = (name: string): boolean => {
  const lowerName = name.toLowerCase();
  return lowerName === 'germany' || lowerName === 'deutschland' || lowerName === 'германия';
};

const getCountryName = (country: Country, language: string): string => {
  return country[`name_${language}` as keyof Country] as string || country.name_en || '';
};

const determineRegion = (country: Country): DeliveryRegion => {
  if (country.name_en === 'Germany') {
    return 'de';
  }
  return country.isEU ? 'inEu' : 'outEu';
};

// ============= КОМПОНЕНТ =============
export const DeliveryChoice: FC = () => {
  const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [] } = location.state || {};

  // Состояния
  const [wentWrong, setWentWrong] = useState(false)
  const [countries, setCountries] = useState<Country[]>([]);
  const [deliveryForm, setDeliveryForm] = useState({
    selectedCountry: '',
    address: '',
    userName: '',
    phone: '',
    region: 'de' as DeliveryRegion
  });
  const [loadingState, setLoadingState] = useState({
    countries: true,
    profile: false
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    isOpen: false,
    message: '',
    type: 'error'
  });

  // Рефы для debounce
  const debounceTimerRef = useRef<number | null>(null);

  // Получение текстов из локализации
  const {
    priceDeliveryT,
    nextBtn,
    headerT,
    selectCountryT,
    addressT,
    nameT,
    phoneT,
    adressInputT,
    nameInputT,
    phoneInputT,
    errorSavingT,
    errorT,
    btnErrorT
  } = TEXTS[language];

  // ============= МЕМОИЗИРОВАННЫЕ ФУНКЦИИ =============

  // Debounced функция для обновления профиля
  const debouncedUpdateProfile = useCallback((field: string, value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!tlgid || !value.trim()) return;

      try {
        const response = await axios.post('/user_update_profile', {
          tlgid,
          [field]: value
        });

        if (response.data.status === 'ok') {
          console.error('сохранено');
          // setSnackbar({
          //   isOpen: true,
          //   message: 'Данные сохранены',
          //   type: 'success'
          // });
        } else {
          throw new Error('Ошибка сохранения');
        }
      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        setSnackbar({
          isOpen: true,
          message: errorSavingT,
          type: 'error'
        });
      }
    }, DEBOUNCE_DELAY);
  }, [tlgid]);

  // Загрузка профиля пользователя
  const fetchUserProfile = useCallback(async () => {
    if (!tlgid) return;

    try {
      setLoadingState(prev => ({ ...prev, profile: true }));
      const response = await axios.get(`/user_get_profile?tlgid=${tlgid}`);

      if (response.data.status === 'ok') {
        const user = response.data.user;
        setDeliveryForm(prev => ({
          ...prev,
          userName: user.name || '',
          phone: user.phone || '',
          address: user.adress || ''
        }));
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setWentWrong(true)
      // setSnackbar({
      //   isOpen: true,
      //   message: 'Ошибка загрузки профиля',
      //   type: 'error'
      // });
    } finally {
      setLoadingState(prev => ({ ...prev, profile: false }));
    }
  }, [tlgid]);

  // Мемоизированный обработчик для settingsButton
  const handleSettingsClick = useCallback(() => {
    navigate('/setting-button-menu');
  }, [navigate]);

  // ============= ОБРАБОТЧИКИ СОБЫТИЙ =============

  const handleFormChange = useCallback((field: keyof typeof deliveryForm, value: string) => {
    setDeliveryForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFieldBlur = useCallback((field: 'name' | 'phone' | 'adress', value: string) => {
    debouncedUpdateProfile(field, value);
  }, [debouncedUpdateProfile]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange('address', e.target.value);
  }, [handleFormChange]);

  const handleAddressBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleFieldBlur('adress', e.target.value);
  }, [handleFieldBlur]);

  const handleAddressClear = useCallback(() => {
    handleFormChange('address', '');
  }, [handleFormChange]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange('userName', e.target.value);
  }, [handleFormChange]);

  const handleNameBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleFieldBlur('name', e.target.value);
  }, [handleFieldBlur]);

  const handleNameClear = useCallback(() => {
    handleFormChange('userName', '');
  }, [handleFormChange]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange('phone', e.target.value);
  }, [handleFormChange]);

  const handlePhoneBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    handleFieldBlur('phone', e.target.value);
  }, [handleFieldBlur]);

  const handlePhoneClear = useCallback(() => {
    handleFormChange('phone', '');
  }, [handleFormChange]);

  const handleCountrySelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.target.value;
    const country = countries.find((item) => item._id === countryId);

    if (country) {
      const newRegion = determineRegion(country);
      setDeliveryForm(prev => ({
        ...prev,
        selectedCountry: countryId,
        region: newRegion
      }));
    }
  }, [countries]);

  const handleNextClick = useCallback(() => {
    const { selectedCountry, address, userName, phone, region } = deliveryForm;

    if (!selectedCountry || !address.trim() || !userName.trim() || !phone.trim()) {
      setSnackbar({
        isOpen: true,
        message: 'Заполните все поля',
        type: 'error'
      });
      return;
    }

    const selectedCountryData = countries.find((country) => country._id === selectedCountry);

    if (!selectedCountryData) {
      setSnackbar({
        isOpen: true,
        message: 'Выберите страну',
        type: 'error'
      });
      return;
    }

    navigate('/payment-choice-page', {
      state: {
        cart,
        deliveryRegion: region,
        deliveryInfo: {
          selectedCountry: selectedCountryData,
          address,
          userName,
          phone
        }
      }
    });
  }, [deliveryForm, countries, cart, navigate]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  }, []);

  // ============= МЕМОИЗИРОВАННЫЕ ВЫЧИСЛЕНИЯ =============

  // Сортировка стран
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => {
      const aName = getCountryName(a, language);
      const bName = getCountryName(b, language);

      if (isGermany(aName)) return -1;
      if (isGermany(bName)) return 1;

      return aName.localeCompare(bName);
    });
  }, [countries, language]);

  // Опции селекта стран
  const countryOptions = useMemo(() => {
    return sortedCountries.map((country) => (
      <option key={country._id} value={country._id}>
        {getCountryName(country, language)}
      </option>
    ));
  }, [sortedCountries, language]);

  // Расчет цен доставки
  const deliveryPrices = useMemo((): DeliveryPriceItem[] => {
    if (!Array.isArray(cart)) return [];

    return cart.map((item: CartItem) => ({
      id: item.id,
      name: String(item[`name_${language}` as keyof CartItem] || item.name_en || ''),
      price: (Number(item[`deliveryPriceToShow_${deliveryForm.region}` as keyof CartItem]) * Number(item.qty)).toFixed(2),
      valute: item.valuteToShow
    }));
  }, [cart, language, deliveryForm.region]);

  // Валидация формы
  const isFormValid = useMemo(() => {
    const { selectedCountry, address, userName, phone } = deliveryForm;
    return Boolean(
      selectedCountry &&
      address.trim() &&
      userName.trim() &&
      phone.trim()
    );
  }, [deliveryForm]);

  // ============= ЭФФЕКТЫ =============

  // Cleanup debounce таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Используем custom hook с автоматическим cleanup
  useSettingsButton(handleSettingsClick);

  // Загрузка профиля пользователя
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Загрузка стран
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingState(prev => ({ ...prev, countries: true }));

        const countriesResponse = await axios.get('/admin_get_countries');
        const countriesData: Country[] = countriesResponse.data || [];

        setCountries(countriesData);

        // Устанавливаем Germany как выбранную страну по умолчанию
        const germanyCountry = countriesData.find(country => {
          const name = getCountryName(country, language);
          return isGermany(name);
        });

        if (germanyCountry) {
          setDeliveryForm(prev => ({
            ...prev,
            selectedCountry: germanyCountry._id,
            region: 'de'
          }));
        } else if (countriesData.length > 0) {
          const firstCountry = countriesData[0];
          setDeliveryForm(prev => ({
            ...prev,
            selectedCountry: firstCountry._id,
            region: determineRegion(firstCountry)
          }));
        }

        setLoadingState(prev => ({ ...prev, countries: false }));
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setWentWrong(true)
        setLoadingState(prev => ({ ...prev, countries: false }));
      }
    };

    fetchCountries();
  }, [language]);

  // ============= РЕНДЕР =============

  const isLoading = loadingState.countries || loadingState.profile;


 




  return (
    <Page back={true}>
      {isLoading && (
        <div style={SPINNER_CONTAINER_STYLE}>
          <Spinner size="m" />
        </div>
      )}

       {wentWrong &&  
          <Section>
                          <Cell>
                            <div style={ERROR_MESSAGE_STYLE}>
                               {errorT}
                            </div>
                            <Button onClick={() => window.location.reload()} size="m">
                              {btnErrorT}
                            </Button>
                          </Cell>
                        </Section>
        
      }

      {!loadingState.countries && !wentWrong && (
        <>
          <Section header={headerT}>
            <Select
              header={selectCountryT}
              value={deliveryForm.selectedCountry}
              onChange={handleCountrySelect}
            >
              {countryOptions}
            </Select>

            <Input
              header={addressT}
              placeholder={adressInputT}
              value={deliveryForm.address}
              onChange={handleAddressChange}
              onBlur={handleAddressBlur}
              after={
                <Tappable
                  Component="div"
                  style={ICON_CONTAINER_STYLE}
                  onClick={handleAddressClear}
                >
                  <Icon24Close />
                </Tappable>
              }
            />

            <Input
              header={nameT}
              placeholder={nameInputT}
              value={deliveryForm.userName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              after={
                <Tappable
                  Component="div"
                  style={ICON_CONTAINER_STYLE}
                  onClick={handleNameClear}
                >
                  <Icon24Close />
                </Tappable>
              }
            />

            <Input
              header={phoneT}
              placeholder={phoneInputT}
              value={deliveryForm.phone}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              after={
                <Tappable
                  Component="div"
                  style={ICON_CONTAINER_STYLE}
                  onClick={handlePhoneClear}
                >
                  <Icon24Close />
                </Tappable>
              }
            />

            <Cell>
              <Text weight="2">{priceDeliveryT}</Text>
              {deliveryPrices.map((item) => (
                <div key={item.id}>
                  {item.name} - {item.price} {item.valute}
                </div>
              ))}
            </Cell>
          </Section>

          <Section style={{ marginBottom: 100, padding: 10 }}>
            <Button
              stretched
              onClick={handleNextClick}
              disabled={!isFormValid}
            >
              {nextBtn}
            </Button>
          </Section>

          {snackbar.isOpen && (
            <Snackbar
              duration={2000}
              onClose={handleSnackbarClose}
            >
              {snackbar.message}
            </Snackbar>
          )}

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
