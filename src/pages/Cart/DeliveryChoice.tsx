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
import { useEffect, useState, useContext } from 'react';
import { LanguageContext } from '../../components/App.tsx';
// import { ValuteContext } from '../../components/App.tsx';
import { settingsButton } from '@telegram-apps/sdk-react';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
// import { useTlgid } from '../../components/Tlgid';
import { Page } from '@/components/Page.tsx';
import { TEXTS } from './texts.ts';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';
// import { count } from 'console';

export const DeliveryChoice: FC = () => {
  // const tlgid = useTlgid();
  const { language } = useContext(LanguageContext);
  // const { valute } = useContext(ValuteContext);
  const navigate = useNavigate();

  const location = useLocation();
  const { cart } = location.state || {}; 
  
  // const [deliveryTypes, setDeliveryTypes] = useState([]);
  // const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [adress, setAdress] = useState('')
  const [userName, setUserName] = useState('')
  const [phone, setPhone] = useState('')
  const [region, setRegion] = useState('de')

  //@ts-ignore
  const { typeDeliveryT, chooseTypeT, infoAboutDeliveryT, priceDeliveryT, nextBtn } = TEXTS[language];

  if (settingsButton.mount.isAvailable()) {
    settingsButton.mount();
    settingsButton.isMounted();
    settingsButton.show();
  }
  
  if (settingsButton.onClick.isAvailable()) {
    function listener() {
      console.log('Clicked!');
      navigate('/setting-button-menu');
    }
    settingsButton.onClick(listener);
  }

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        
        // Загружаем страны
        const countriesResponse = await axios.get('/admin_get_countries');
        console.log('countries', countriesResponse.data);
        
        const countriesData = countriesResponse.data || [];
        
        // Сортируем страны: Germany первым, остальные по алфавиту
        const sortedCountries = [...countriesData].sort((a, b) => {
          const aName = a[`name_${language}`] || a.name_en || '';
          const bName = b[`name_${language}`] || b.name_en || '';
          
          // Germany всегда первый
          if (aName.toLowerCase() === 'germany' || aName.toLowerCase() === 'deutschland' || aName.toLowerCase() === 'германия') {
            return -1;
          }
          if (bName.toLowerCase() === 'germany' || bName.toLowerCase() === 'deutschland' || bName.toLowerCase() === 'германия') {
            return 1;
          }
          
          return aName.localeCompare(bName);
        });
        
        console.log('sortedCountries', sortedCountries)

        //@ts-ignore
        setCountries(sortedCountries);
        
        // Устанавливаем Germany как выбранную страну по умолчанию
        const germanyCountry = sortedCountries.find(country => {
          const name = country[`name_${language}`] || country.name_en || '';
          return name.toLowerCase() === 'germany' || 
                 name.toLowerCase() === 'deutschland' || 
                 name.toLowerCase() === 'германия';
        });
        
        if (germanyCountry) {
          setSelectedCountry(germanyCountry._id);
          
        } else if (sortedCountries.length > 0) {
          setSelectedCountry(sortedCountries[0]._id);
          
        }

        
        console.log('CAAAART', cart)


        
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [language]);


// FIXME: при переходе на след страницу добавить инфо в БД об информации, которую ввел юзер
// адрес, имя, телефон

  const nextBtnHandler = () => {
    if (selectedCountry && adress && userName && phone) {
      const selectedCountryData = countries.find((country: any) => country._id === selectedCountry);
      
      console.log('selectedCountryData',selectedCountry )
      // return

      navigate('/payment-choice-page', {
        state: {
          cart: cart,
          deliveryRegion: region,
          deliveryInfo: {
            selectedCountry:selectedCountryData, 
            address: adress,
            userName: userName,
            phone: phone
          }
        }
      });
    } else {
      setOpenSnackbar(true);
    }
  };

  async function setRegionForDeliveryPrice(country:any){
      countries.map((item:any) =>{
        if (item._id == country){

            if (item.name_en == 'Germany'){
                setRegion('de')
             return
            }

            if(item.isEU){
             setRegion('inEu')
          } else {
            setRegion('outEu')
          }
        }
      })
  }

async function countrySelectHandler(e:any){

    setSelectedCountry(e.target.value)
    await setRegionForDeliveryPrice(e.target.value)
}  

  return (
    <Page back={true}>
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
          {/* {console.log('Rendering deliveryTypes:', deliveryTypes, 'Length:', deliveryTypes.length)} */}
            
              <Section header="Информация по доставке">
                <Select 
                  header="Select Country" 
                  //  status="focused" 
                  value={selectedCountry}
                  // onChange={(e) => setSelectedCountry(e.target.value)}
                  onChange={(e) => countrySelectHandler(e)}
                >
                  {countries.map((country: any) => (
                    <option key={country._id} value={country._id}>
                      {country[`name_${language}`] || country.name_en}
                    </option>
                  ))}
                </Select>
              {/* </Section> */}
            

            <Input 
              // status="focused" 
              header="Adress" 
              placeholder="Write and clean me" 
              value={adress} 
              onChange={e => setAdress(e.target.value)} 
              after={
            <Tappable 
              Component="div" 
              style={{
                display: 'flex'
              }} onClick={() => setAdress('')}>
                      <Icon24Close />
            </Tappable>
          } />

            <Input 
              // status="focused" 
              header="Name" 
              placeholder="Write and clean me" 
              value={userName} 
              onChange={e => setUserName(e.target.value)} 
              after={
            <Tappable 
              Component="div" 
              style={{
                display: 'flex'
              }} onClick={() => setUserName('')}>
                      <Icon24Close />
            </Tappable>
          } />
           
            <Input 
              // status="focused" 
              header="Phone" 
              placeholder="Write and clean me" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              after={
            <Tappable 
              Component="div" 
              style={{
                display: 'flex'
              }} onClick={() => setPhone('')}>
                      <Icon24Close />
            </Tappable>
          } />


           
<Cell>
  <>
<Text weight="2" >Стоимость доставки:</Text>
            {cart.map((item: any) => (
                <div key={item.id}>{item[`name_${language}`]} - {(Number(item[`deliveryPriceToShow_${region}`]) * Number(item.qty)).toFixed(2)} {item.valuteToShow} </div>
              ))}
              </>
              
              
              
              </Cell>

            

            </Section>

            <Section style={{ marginBottom: 100, padding: 10 }}>
              <Button 
                stretched 
                onClick={nextBtnHandler}
                disabled={!selectedCountry || !adress || !userName || !phone}
              >
                {nextBtn}
              </Button>
            </Section>

          {openSnackbar && (
            <Snackbar duration={2000} onClose={() => setOpenSnackbar(false)}>
              Заполните все поля
            </Snackbar>
          )}

          <TabbarMenu />
        </>
      )}
    </Page>
  );
};