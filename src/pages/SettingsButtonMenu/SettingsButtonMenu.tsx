import {
  Section,
  Cell,
  List,
  Select,
  Spinner,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useContext, useState } from 'react';

import { useTlgid } from '../../components/Tlgid';

import axios from '../../axios';

import { LanguageContext } from '../../components/App';
import { ValuteContext } from '../../components/App';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { Page } from '@/components/Page.tsx';

import { TEXTS } from './texts.ts';

import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
import { Icon16Chevron } from '@telegram-apps/telegram-ui/dist/icons/16/chevron';

export const SettingsButtonMenu: FC = () => {
  const [isShowLanguageSelect, setShowLanguageSelect] = useState(false);
  const [isShowValuteSelect, setShowValuteSelect] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [isLoading] = useState(false);
  // const [userNPid, setUserNPid] = useState('');

  const tlgid = useTlgid();

  const { language, setLanguage } = useContext(LanguageContext);
  const { valute, setValute } = useContext(ValuteContext);

  const [selectedValute, setSelectedValute] = useState(valute);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  //FIXME:
  // @ts-ignore
  const {title,languageT,valuteT, languageTsubtitle, valuteTsubtitle, yourid, purposeid,copiedtext,noid,createid } = TEXTS[language];

  // получить id юзера
  // useEffect(() => {
  //   // TODO: можно пост на гет испправить, т.к. получаем инфо

  //   const fetchUserInfo = async () => {
  //     try {
  //       const response = await axios.post('/get_user_id', {
  //         tlgid: tlgid,
  //       });

  //       console.log(response.data);
  //       const nowpaymentid = response.data.nowpaymentid;

  //       if (nowpaymentid != 0) {
  //         setIdNPexist(true);
  //         setUserNPid(nowpaymentid);
          
  //       } else {
  //         setIdNPexist(false);
  //         setUserNPid(noid);
  //       }
  //     } catch (error) {
  //       console.error('Ошибка при выполнении запроса:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);

  function showLanguageSelect() {
    setShowValuteSelect(false);
    setShowLanguageSelect(!isShowLanguageSelect);
  }

  function showValuteSelect() {
    setShowLanguageSelect(false);
    setShowValuteSelect(!isShowValuteSelect);
  }

  function selectLanguageHandler(event: any) {
    setLanguage(event.target.value);
    setSelectedLanguage(event.target.value);
    console.log('set language=', event.target.value);

    axios.post('/change_language', {
      tlgid: tlgid,
      language: event.target.value,
    });
  }

  function selectValuteHandler(event: any) {
    setValute(event.target.value);
    setSelectedValute(event.target.value);
    console.log('set valute=', event.target.value);

    axios.post('/change_valute', {
      tlgid: tlgid,
      valute: event.target.value,
    });
  }

  // const copyAdress = async () => {
  //   try {
  //     await navigator.clipboard.writeText(userNPid);
  //     console.log('copied=', userNPid);
  //     setShowTextCopied(true);

  //     setTimeout(() => setShowTextCopied(false), 2000);
  //   } catch (err) {
  //     console.error('Ошибка: ', err);
  //   }
  // };

  // async function create() {
  //   try {
  //     setIsLoading(true);
  //     console.log('start creatin...');

  //     const response = await axios.post('/create_user_NpId', {
  //       tlgid: tlgid,
  //     });

  //     console.log('created = ', response);
  //     setUserNPid(response.data.nowpaymentid);
  //     setIdNPexist(true);
  //   } catch (error) {
  //     console.error('Ошибка при выполнении запроса:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // const buttonRef = useRef(null);

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
            {/* <Section>
              
              <Section>
                <Cell
                  before={<Icon32ProfileColoredSquare />}
                  interactiveAnimation="opacity"
                  subtitle={purposeid}
                  multiline
                >
                  {yourid}

                  {!idNPexist && (
                    <span
                      style={{
                        color: '#168acd',
                        fontWeight: '600',
                      }}
                    >
                      {' '}
                      {userNPid}
                    </span>
                  )}
                  {idNPexist && (
                    <Tappable
                      Component="span"
                      style={{
                        color: '#168acd',
                        fontWeight: '600',
                      }}
                      onClick={copyAdress}
                      ref={buttonRef}
                    >
                      {' '}
                      {userNPid}
                    </Tappable>
                  )}
                </Cell>

                {showTextCopied && (
                  <Tooltip mode="light" targetRef={buttonRef} withArrow={false}>
                    {copiedtext}
                  </Tooltip>
                )}

                {!idNPexist && (
                  <ButtonCell
                    before={<Icon28AddCircle />}
                    interactiveAnimation="background"
                    onClick={() => create()}
                  >
                    {createid}
                  </ButtonCell>
                )}
              </Section>
            </Section> */}

            <Section header={title}>
              <div onClick={showLanguageSelect}>
                <Cell
                  before={<Icon32ProfileColoredSquare />}
                  after={<Icon16Chevron />}
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
                  before={<Icon32ProfileColoredSquare />}
                  after={<Icon16Chevron />}
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
            </Section>
          </List>

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};
