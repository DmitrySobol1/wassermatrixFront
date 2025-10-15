import { useMemo } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import {
  retrieveLaunchParams,
  useSignal,
  isMiniAppDark,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { useState } from 'react';
import { createContext, Dispatch, SetStateAction } from 'react';

import { routes } from '@/navigation/routes.tsx';

// FIXME: change type
// export const LanguageContext:any = createContext('');

import { useTlgid } from '../components/Tlgid';
import { useEffect } from 'react';
import axios from '../axios';

type LanguageContextType = {
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en', // значение по умолчанию
  setLanguage: () => {}, // заглушка для функции
});

type TotalBalanceContextType = {
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
};

export const TotalBalanceContext = createContext<TotalBalanceContextType>({
  balance: 0, // значение по умолчанию
  setBalance: () => {}, // заглушка для функции
});

type ValuteContextType = {
  valute: string;
  setValute: Dispatch<SetStateAction<string>>;
};

export const ValuteContext = createContext<ValuteContextType>({
  valute: 'rub', // значение по умолчанию
  setValute: () => {}, // заглушка для функции
});

export function App() {
  const [language, setLanguage] = useState('en');

  const tlgid = useTlgid();

  // для языка по умолчанию
  useEffect(() => {
    axios
      .post('/checkingForDefaultLanuage', {
        tlgid: tlgid,
      })
      .then((response) => {
        if (response) {
          console.log('lang from back=', response.data.userData.language);

          setLanguage(response.data.userData.language);
        }
      })
      .catch((error) => {
        console.error('❌ Ошибка при выполнении запроса:', error);
      })
      .finally(() => {});
  }, []);

  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);

  // const [language, setLanguage] = useState('en');
  const [balance, setBalance] = useState(0);
  const [valute, setValute] = useState('₽');

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <LanguageContext.Provider value={{ language, setLanguage }}>
        <ValuteContext.Provider value={{ valute, setValute }}>
          <TotalBalanceContext.Provider value={{ balance, setBalance }}>
            <HashRouter>
              <Routes>
                {routes.map((route) => (
                  <Route key={route.path} {...route} />
                ))}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </HashRouter>
          </TotalBalanceContext.Provider>
        </ValuteContext.Provider>
      </LanguageContext.Provider>
    </AppRoot>
  );
}
