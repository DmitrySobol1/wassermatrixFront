
import { Section, List, Steps, Cell, Button } from '@telegram-apps/telegram-ui';

import type { FC } from 'react';
import { useState,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/App.tsx';



import { Page } from '@/components/Page.tsx';

import noimage from '../../components/img/noimage.jpg';
// import onboardingImg2 from '../../img/onb2.jpg';
// import onboardingImg3 from '../../img/onb3.jpg';

import styles from './Onboarding.module.css';

import { TEXTS } from './texts.ts';

// export const Onboarding: FC = () => {

// const location = useLocation();

//TODO: когда в конце онбординга человек перейдет на wallet page, прокинуть параметр nowpaymentid и он будет = 0
// чтобы на wallet page  нормально данные отобразить! 
// const { nowpaymentid } = location.state || {};


//   return (
//     <Page>
//       <List>
//         <Section header="This is onboarding">
//           <Cell subtitle="User data, chat information, technical data">
//             onboarding onboarding onboarding{' '}
//           </Cell>
//         </Section>
//       </List>
//     </Page>
//   );
// };

export const Onboarding: FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);


  // const location = useLocation();

//TODO: когда в конце онбординга человек перейдет на wallet page, прокинуть параметр nowpaymentid и он будет = 0
// чтобы на wallet page  нормально данные отобразить! 
// const { nowpaymentid } = location.state || {};

 //FIXME:
  // @ts-ignore
const { title,textPage1,textPage2,textPage3,nextBtn } = TEXTS[language];



  function mainBtnListener() {
    setStep(step + 1);
    if (step == 3) {
      navigate('/catalog-page');
    }
  }

  return (
    <Page back={true}>
      <List>
        <Section header={title}>
          <Steps count={3} progress={step} />
          {step == 1 && (
            <Cell multiline>
              <div className={styles.divImg}>
                <img src={noimage} className={styles.onboardingImg} />
              </div>
              <p>
                {textPage1}
              </p>
            </Cell>
          )}
          {step == 2 && (
            <Cell multiline>
              <div className={styles.divImg}>
                <img src={noimage} className={styles.onboardingImg} />
              </div>
              <p>
                {textPage2}
              </p>
            </Cell>
          )}
          {step == 3 && (
            <Cell multiline>
              <div className={styles.divImg}>
                <img src={noimage} className={styles.onboardingImg} />
              </div>
              <p>
                {textPage3}
              </p>
            </Cell>
          )}

          <div className={styles.btnDiv}>
            <div className={styles.nextBtn}>
              <Button
                mode="filled"
                size="m"
                stretched
                onClick={mainBtnListener}
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