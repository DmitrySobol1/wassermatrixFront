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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { routes } from '@/navigation/routes.tsx';
import type { SupportedLanguage } from '@/types/i18n.types';

import { useTlgid } from '../components/Tlgid';
import { useEffect } from 'react';
import axios from '../axios';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes (was cacheTime in v4)
      retry: 2, // Retry failed requests 2 times
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
});

type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: Dispatch<SetStateAction<SupportedLanguage>>;
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
  const [language, setLanguage] = useState<SupportedLanguage>('en');

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

          const receivedLanguage = response.data.userData.language as SupportedLanguage;
          setLanguage(receivedLanguage);
        }
      })
      .catch((error) => {
        console.error('❌ Ошибка при выполнении запроса:', error);
      })
      .finally(() => {});
  }, []);

  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);

  const [balance, setBalance] = useState(0);
  const [valute, setValute] = useState('₽');

  return (
    <QueryClientProvider client={queryClient}>
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

      {/* React Query DevTools - only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
