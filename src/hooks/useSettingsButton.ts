import { useEffect } from 'react';
import { settingsButton } from '@telegram-apps/sdk-react';

/**
 * Custom hook для управления settingsButton с правильной cleanup логикой
 *
 * Автоматически монтирует, показывает и настраивает обработчик клика для settingsButton.
 * Обеспечивает корректную очистку listener при размонтировании компонента.
 *
 * Решает проблему утечки памяти, которая возникает при добавлении event listener
 * без последующего удаления.
 *
 * @param onSettingsClick - Callback функция, вызываемая при клике на settingsButton
 *
 * @example
 * ```tsx
 * import { useSettingsButton } from '@/hooks/useSettingsButton';
 * import { useCallback } from 'react';
 * import { useNavigate } from 'react-router-dom';
 *
 * const MyComponent: FC = () => {
 *   const navigate = useNavigate();
 *
 *   const handleSettings = useCallback(() => {
 *     navigate('/setting-button-menu');
 *   }, [navigate]);
 *
 *   useSettingsButton(handleSettings);
 *
 *   return <div>...</div>;
 * };
 * ```
 */
export const useSettingsButton = (onSettingsClick: () => void): void => {
  useEffect(() => {
    // Монтируем и показываем кнопку настроек
    if (settingsButton.mount.isAvailable()) {
      settingsButton.mount();
      settingsButton.show();
    }

    const listener = () => {
      onSettingsClick();
    };

    let cleanup: (() => void) | undefined;

    // Добавляем обработчик клика
    if (settingsButton.onClick.isAvailable()) {
      const unsubscribe = settingsButton.onClick(listener);

      // Создаем cleanup функцию для корректного удаления listener
      cleanup = () => {
        // Удаляем listener при размонтировании
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }

        // Размонтируем кнопку, если доступна функция unmount
        if (settingsButton.unmount && typeof settingsButton.unmount === 'function') {
          settingsButton.unmount();
        }
      };
    }

    // React вызовет cleanup при размонтировании компонента
    return cleanup;
  }, [onSettingsClick]);
};
