import type { SupportedLanguage } from '@/types/i18n.types';

export type AccountTexts = {
  headerT: string;
  myOrdersT: string;
  settingsT: string;
  orderFromT: string;
  currentStatusT: string;
  openReceiptT: string;
  deliveryAddressT: string;
  qtyT: string;
  priceGoodT: string;
  priceDeliveryT: string;
  itogoT: string;
  pcsT: string;
  notPaydT: string;
  payBtnT: string;
  loadingT: string;
  myPromocodesT: string;
  saleT: string;
  validUntilT: string;
  notPromocodeT: string;
  footerPromocodesT: string;
  copiedT: string;
  myCashbackT: string;
  myInfoT: string;
  purchaseQtyT: string;
  purchaseSumT: string;
  clientCashbackLevelT: string;
  deltaToNextLevelT: string;
  maxLevelT: string;
  levelT: string;
  totalSumT: string;
  fromPurchaseT: string;
  cashbackSystemT: string;
  cashbackBallT: string;
  referalSystemT: string;
  refMessageT: string;
  howCBworksT: string;
  cashbackLevelsT: string;
  cashbackInfoT: string;
  refInfoHeaderT: string;
  refInfoText1T: string;
  refInfoText2T: string;
  refInfoText3T: string;
  inviteBtnT: string;
  myReferalsT: string;
  listReferalsT: string;
  personT: string;
  noRefT: string;
  howRefWorksT: string;
  quantityRefT: string;
  zaT: string;
  za2T: string;
  getCbT: string;
  purchasedT: string;
  etaT: string;
  pressAsDeliveredT: string;
  errorT: string;
  btnErrorT: string;
  renewT: string;
  noOrderT: string;
  cantLoadRefT: string
};

export const TEXTS: Record<SupportedLanguage, AccountTexts> = {
  ru: {
   headerT: 'Мой аккаунт',
   myOrdersT: 'Мои заказы',
   settingsT: 'Настройки',
   orderFromT: 'заказ от',
   currentStatusT: 'Текущий статус заказа',
   openReceiptT: 'открыть чек',
   deliveryAddressT: 'Адресс',
   qtyT: 'Кол-во:',
   priceGoodT: 'Стоимость товара:',
   priceDeliveryT: 'Стоимость доставки:',
   itogoT: 'Итого к оплате:',
   pcsT: 'шт.',
   notPaydT: 'не оплачен',
   payBtnT: 'Оплатить',
   loadingT: 'Загрузка ...',
   myPromocodesT: 'Мои промокоды',
   saleT: 'скидка:',
   validUntilT: 'действует до:',
   notPromocodeT: 'У вас нет персональных промокодов',
   footerPromocodesT: 'Нажмите на промокод, чтобы скопировать. Примените его при оплате для получения скидки',
   copiedT: 'промокод скопирован',
   myCashbackT: 'Кэшбэк',
   myInfoT: 'Мои данные',
   purchaseQtyT: 'Всего покупок',
   purchaseSumT: 'Всего покупок на сумму',
   clientCashbackLevelT: 'Ваш уровень кешбэка',
   deltaToNextLevelT: 'Осталось до следующего уровня',
   maxLevelT: 'максимальный уровень',
   levelT: 'Уровень',
   totalSumT: 'Сумма всех сделанных покупок ≥',
   fromPurchaseT: 'от покупки',
   cashbackSystemT: 'Система кешбэка',
   cashbackBallT: 'Количество баллов',
   referalSystemT: 'Реферальная система',
   refMessageT: '👆 Рекомендую данный магазин',
   howCBworksT: 'Как работает система кешбэка',
   cashbackLevelsT: 'Уровни кешбэка',
   cashbackInfoT: 'За ваши покупки вам начисляются баллы кешбека, которыми можно оплачивать дальнейшие покупки. Чем больше общая сумма всех покупок - тем выше процент кешбека:',
   refInfoHeaderT: 'Приглашайте рефералов и получайте:',
   refInfoText1T: 'Промокоды за количество приглашенных',
   refInfoText2T: 'Кешбек за покупки рефералов',
   refInfoText3T: 'Промокоды за количество',
   inviteBtnT: 'Пригласить друга',
   myReferalsT: 'Мои рефералы',
   listReferalsT: 'Список рефералов',
   personT: 'чел.',
   noRefT: 'У вас пока нет рефералов',
   howRefWorksT: 'Как работает реферальная система',
   quantityRefT: 'Чем больше людей пригласите, тем выше будет промокод со скидкой:',
   zaT: 'за',
   za2T: 'чел. - промокод на скидку',
   getCbT: 'Получайте кешбек баллы за все покупки ваших рефералов:',
   purchasedT: 'от купленных товаров',
   etaT: 'ожидаемая дата доставки: ',
   pressAsDeliveredT: 'отметьте, когда получите заказ',
   errorT: 'Что-то пошло не так...', 
   btnErrorT: 'Попробовать ещё раз',
   renewT: 'обновление...',
   noOrderT: 'У вас пока нет заказов',
   cantLoadRefT: 'Не удалось загрузить список рефералов, попробуйте позже'
    
  },
  en: {
    headerT: 'My account',
    myOrdersT: 'My orders',
    settingsT: 'Settings',
    orderFromT: 'order from',
    currentStatusT: 'Current status of order',
    openReceiptT: 'open receipt',
    deliveryAddressT: 'Address',
    qtyT: 'Amount:',
    priceGoodT: 'Item price:',
    priceDeliveryT: 'Delivery price:',
    itogoT: 'Total to pay:',
    pcsT: 'pcs.',
    notPaydT: 'not payed',
    payBtnT: 'Pay',
    loadingT: 'Loading ...',
    myPromocodesT: 'My promocodes',
    saleT: 'sale:',
    validUntilT: 'valid until:',
    notPromocodeT: 'You have no personal promocodes now',
    footerPromocodesT: 'Click on the promo code to copy it. Apply it while pay to receive your discount.',
    copiedT: 'promocode copied',
    myCashbackT: 'Cashback',
    myInfoT: 'My information',
    purchaseQtyT: 'Purchases quantity',
    purchaseSumT: 'Purchases amount',
    clientCashbackLevelT: 'Your cachback level',
    deltaToNextLevelT: 'Purchase for the next level',
    maxLevelT: 'max level',
    levelT: 'Level',
    totalSumT: 'Total amount of all purchases you made ≥',
    fromPurchaseT: 'from purchase',
    cashbackSystemT: 'Cashback system',
    cashbackBallT: 'Your current cashback value',
    referalSystemT: 'Referal system',
    refMessageT: '👆 I recommend this store',
    howCBworksT: 'How cashback system works',
    cashbackLevelsT: 'Cashback levels',
    cashbackInfoT: 'You earn cashback points for your purchases, which can be used to pay for future purchases. The higher the total amount of all purchases, the higher the cashback percentage:',
    refInfoHeaderT: 'Invite referals and get:',
    refInfoText1T: 'Promocode for quantity of invited referals',
   refInfoText2T: 'Cashback for referals purchase',
   refInfoText3T: 'Promocode for quantity',
   inviteBtnT: 'Invite friend',
   myReferalsT: 'My referals',
   listReferalsT: 'Referals list',
   personT: 'pers.',
   noRefT: 'You have no referals yet',
   howRefWorksT: 'How referal system works',
   quantityRefT: 'The more people you invite, the higher the discount promo code you get:',
   zaT: 'for',
   za2T: 'pers. - promocode with sale',
   getCbT: 'Get cashback points for all purchases made by referals:',
   purchasedT: 'from purchesed goods',
   etaT: 'estimate date of delivery: ',
   pressAsDeliveredT: 'press, when order delivered',
   errorT: 'Something went wrong...',
   btnErrorT: 'Try again',
   renewT: 'renew...',
   noOrderT: 'You have no order yet',
   cantLoadRefT: 'Some mistake when loading referal list, plese try later'
  
   
    
  },
  de: {
    headerT: 'Mein konto',
    myOrdersT: 'Meine bestellungen',
    settingsT: 'Einstellungen',
    orderFromT: 'bestellung vom',
    currentStatusT: 'Aktueller status der bestellung',
    openReceiptT: 'offene quittung',
    deliveryAddressT: 'Adresse',
    qtyT: 'Betrag:',
    priceGoodT: 'Artikelpreis:',
    priceDeliveryT: 'Preis der Lieferung:',
    itogoT: 'Gesamtbetrag:',
    pcsT: 'pcs.',
    notPaydT: 'nicht bezahlt',
    payBtnT: 'Bezahlen',
    loadingT: 'Laden ...',
    myPromocodesT: 'Meine promo-codes',
    saleT: 'sale:',
    validUntilT: 'gültig bis:',
    notPromocodeT: 'Sie haben derzeit keine persönlichen Promo-Codes',
    footerPromocodesT: 'Klicken Sie auf den Promo-Code, um ihn zu kopieren. Geben Sie ihn beim Bezahlen ein, um den Rabatt zu erhalten',
    copiedT: 'promo-Code kopiert',
    myCashbackT: 'Cashback',
    myInfoT: 'Meine informationen',
    purchaseQtyT: 'Einkaufsmenge',
    purchaseSumT: 'Kaufsumme',
    clientCashbackLevelT: 'Ihre cashback-stufe',
    deltaToNextLevelT: 'Kauf für die nächste Stufe',
    maxLevelT: 'maximale stufe',
    levelT: 'Stufe',
    totalSumT: 'Gesamtbetrag der getätigten Einkäufe ≥', 
    fromPurchaseT: 'vom kauf',
    cashbackSystemT: 'Cashback-system',
    cashbackBallT: 'Ihr aktueller cashback-wert',
    referalSystemT: 'Empfehlungssystem',
    refMessageT: '👆 Ich empfehle diesen Shop weiter',
    howCBworksT: 'Wie funktioniert Cashback',
    cashbackLevelsT: 'Cashback-stufen',
    cashbackInfoT: 'Für Ihre Einkäufe erhalten Sie Cashback-Punkte, mit denen Sie weitere Einkäufe bezahlen können. Je höher der Gesamtbetrag aller Einkäufe ist, desto höher ist der Cashback-Prozentsatz:',
    refInfoHeaderT: 'Laden sie freunde ein und erhalten sie:',
    refInfoText1T: 'Promocode für die Anzahl der eingeladenen Empfehlungen',
    refInfoText2T: 'Cashback für Empfehlungen',
    refInfoText3T: 'Promocode für Menge',
    inviteBtnT: 'Freund einladen',
    myReferalsT: 'Meine empfehlungen',
    listReferalsT: 'Empfehlungsliste',
    personT: 'pers.',
    noRefT: 'Sie haben noch keine Empfehlungen',
    howRefWorksT: 'Wie das Empfehlungssystem funktioniert',
    quantityRefT: 'Je mehr Personen Sie einladen, desto höher ist der Rabatt-Promo-Code, den Sie erhalten:',
    zaT: 'für',
    za2T: 'pers. - promo-Code mit rabatt',
    getCbT: 'Erhalten Sie Cashback-Punkte für alle Einkäufe, die von Ihren Empfehlungen getätigt werden:',
    purchasedT: 'von gekauften Waren',
    etaT: 'voraussichtlicher liefertermin: ',
    pressAsDeliveredT: 'presse, wenn bestellung geliefert',
    errorT: 'Etwas ist schiefgelaufen...',
    btnErrorT: 'Versuchen Sie es erneut',
    renewT: 'erneuern...',
     noOrderT: 'Sie haben noch keine Bestellung aufgegeben',
     cantLoadRefT: 'Beim Laden der Empfehlungsliste ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut'
      
  },
};


  