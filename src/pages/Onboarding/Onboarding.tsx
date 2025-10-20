import { Section, List, Steps, Cell, Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState, useContext, useCallback, useMemo, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/App.tsx';
import { Page } from '@/components/Page.tsx';
import pic1 from '../../components/img/img1_onb.jpg';
import pic2 from '../../components/img/img2_onb.jpg';
import pic3 from '../../components/img/img3_onb.jpg';
import styles from './Onboarding.module.css';
import { TEXTS } from './texts.ts';

// ============================================================================
// Типы
// ============================================================================

type Language = 'ru' | 'en' | 'de';

interface OnboardingStepData {
  image: string;
  text: string;
}

interface OnboardingStepProps extends OnboardingStepData {
  stepNumber: number;
}

// ============================================================================
// Вспомогательные компоненты
// ============================================================================

/**
 * Мемоизированный компонент одного шага онбординга
 *
 * React.memo предотвращает ре-рендеры при неизменных пропсах
 */
const OnboardingStep = memo<OnboardingStepProps>(({ image, text, stepNumber }) => (
  <Cell multiline>
    <div className={styles.divImg}>
      <img
        src={image}
        className={styles.onboardingImg}
        alt={`Онбординг шаг ${stepNumber}: ${text.slice(0, 50)}...`}
      />
    </div>
    <p>{text}</p>
  </Cell>
));

OnboardingStep.displayName = 'OnboardingStep';

// ============================================================================
// Основной компонент
// ============================================================================

export const Onboarding: FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  // Мемоизация текстов с fallback на английский
  const texts = useMemo(
    () => TEXTS[language as Language] || TEXTS.en,
    [language]
  );

  const { title, textPage1, textPage2, textPage3, nextBtn } = texts;

  // Мемоизация данных шагов
  const STEPS_DATA = useMemo<OnboardingStepData[]>(() => [
    { image: pic1, text: textPage1 },
    { image: pic2, text: textPage2 },
    { image: pic3, text: textPage3 },
  ], [textPage1, textPage2, textPage3]);

  const currentStep = STEPS_DATA[step - 1];

  // Preloading следующего изображения для мгновенных переходов
  useEffect(() => {
    if (step < 3) {
      const nextImage = new Image();
      nextImage.src = STEPS_DATA[step].image;
    }
  }, [step, STEPS_DATA]);

  // Обработчик кнопки "Далее"
  const handleNext = useCallback(() => {
    if (step === 3) {
      navigate('/catalog-page');
    } else {
      setStep(prev => prev + 1);
    }
  }, [step, navigate]);



  return (
    <Page back={true}>
      <List>
        <Section header={title}>
          <Steps count={3} progress={step} />

          <OnboardingStep
            image={currentStep.image}
            text={currentStep.text}
            stepNumber={step}
          />

          <div className={styles.btnDiv}>
            <div className={styles.nextBtn}>
              <Button
                mode="filled"
                size="m"
                stretched
                onClick={handleNext}
              >
                {nextBtn}
              </Button>
            </div>
          </div>
        </Section>
      </List>
    </Page>
  );
};
