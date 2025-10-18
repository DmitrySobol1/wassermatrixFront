// ============================================================================
// Типы
// ============================================================================

/**
 * Интерфейс для текстовых констант страниц корзины и оплаты
 *
 * Поддерживаемые языки: ru, en, de
 */
interface TextsType {
  plusT: string;
  minusT: string;
  deleteT: string;
  totalT: string;
  pcsT: string;
  addedT: string;
  typeDeliveryT: string;
  chooseTypeT: string;
  infoAboutDeliveryT: string;
  priceDeliveryT: string;
  nextBtn: string;
  itemAdded: string;
  payBtn: string;
  payBtn2T: string;
  headerT: string;
  header2T: string;
  selectCountryT: string;
  addressT: string;
  adressInputT: string;
  nameT: string;
  nameInputT: string;
  phoneT: string;
  phoneInputT: string;
  qtyT: string;
  priceGoodT: string;
  itogoT: string;
  successT: string;
  infoT: string;
  myOrderT: string;
  emptyCartT: string;
  toCatalogT: string;
  enterPromocodeT: string;
  promocodePlaceholderT: string;
  applyT: string;
  useCashbackT: string;
  cashbackPlaceholderT: string;
  writeoffT: string;
  zeroCashbackT: string;
  zeroCashbackInfoT: string;
  availableCashbackT: string;
  willAddWhenPurchaseT: string;
  toAddCashbackT: string;
  promocodeT: string;
  writeOffT: string;
  LoyaltySystemT: string;
  setPromocodeT: string;
  errorT: string;
  goToT: string;
  goToBtnT: string;
}

// ============================================================================
// Константы
// ============================================================================

export const TEXTS: Record<'ru' | 'en' | 'de', TextsType> = {
  ru: {
   plusT: 'плюс 1',
   minusT: 'минус 1',
   deleteT: 'удалить товар',
   totalT : 'Всего:',
   pcsT: 'шт.',
   addedT: 'добавлено:',
   typeDeliveryT: 'Способ доставки',
   chooseTypeT: 'Выберите способ, как вы хотите получить товар:',
   infoAboutDeliveryT: 'Информация о доставке:',
   priceDeliveryT: 'Стоимость доставки:',
   nextBtn: 'Оформить',
   itemAdded: 'Товар добавлен',
   payBtn: 'К оплате',
   payBtn2T : 'Оплатить',
   headerT: 'Информация по доставке',
   header2T: 'Информация по оплате',
   selectCountryT: 'Выберите страну',
   addressT: 'Адрес',
   adressInputT: 'ваш адрес',
   nameT: 'Имя',
   nameInputT: 'ваше имя',
   phoneT: 'Телефон',
   phoneInputT: 'ваш номер телефона',
   qtyT: 'Кол-во:',
   priceGoodT: 'Стоимость товара:',
   itogoT: 'Итого к оплате',
   successT: 'Заказ успешно оформлен!',
   infoT: 'Вы можете следить за информацией по заказу в разделе: Аккаунт > Заказы',
   myOrderT: 'Мои заказы',
   emptyCartT: 'Корзина пустая',
   toCatalogT: 'В каталог',
   enterPromocodeT: 'Использовать промокод',
   promocodePlaceholderT: 'напишите промокод',
   applyT: 'применить',
   useCashbackT: 'У вас:',
   cashbackPlaceholderT: 'укажите количество',
   writeoffT: 'списать',
   zeroCashbackT: 'У вас сейчас 0 баллов',
   zeroCashbackInfoT: 'Мы начислим вас кешбек баллы после данной покупки',
   availableCashbackT: 'доступно',
   willAddWhenPurchaseT: 'Начислим за покупку',
   toAddCashbackT: 'Начислить',
   promocodeT: 'Промокод',
   writeOffT: 'Списать',
   LoyaltySystemT: 'Система лояльности',
   setPromocodeT: 'Введите промокод',
    errorT: 'Что-то пошло не так...',
    goToT: 'Перейдите в раздел Аккаунт - Заказы и оплатите заказ',
    goToBtnT: 'Перейти в Аккаунт' 
    
  },
  en: {
    plusT: 'add 1',
   minusT: 'remove 1',
   deleteT: 'delete item',
   totalT : 'Total:',
   pcsT: 'pcs.',
   addedT: 'added:',
   typeDeliveryT: 'Delivery type',
   chooseTypeT: 'Choose the way you would like to receive items',
   infoAboutDeliveryT: 'Additional information:',
  priceDeliveryT: 'Delivery price:',
   nextBtn: 'To order',
   itemAdded: 'Item added',
   payBtn: 'To pay',
   payBtn2T : 'Pay',
   headerT: 'Delivery information',
   header2T: 'Payment information',
   selectCountryT: 'Choose country',
   addressT: 'Address',
   adressInputT: 'write your adress',
   nameT: 'Name',
   nameInputT: 'write your name',
   phoneT: 'Phone',
   phoneInputT: 'write phone number',
   qtyT: 'Amount:',
   priceGoodT: 'Item price:',
   itogoT: 'Total to pay',
   successT: 'Order has been placed successfully !',
   infoT: 'You can track your order information in the section: Account > Orders',
   myOrderT: 'My orders',
   emptyCartT: 'The cart is empty',
   toCatalogT: 'To catalog',
   enterPromocodeT: 'Use promocode',
   promocodePlaceholderT: 'fill in promocode',
   applyT: 'apply',
   useCashbackT: 'You have:',
   cashbackPlaceholderT: 'fill in quantity',
   writeoffT: 'write off',
   zeroCashbackT: 'You have 0 cashback points now',
   zeroCashbackInfoT: 'We will credit you with cashback points after this purchase',
   availableCashbackT: 'available',
   willAddWhenPurchaseT: 'will add when purshase',
   toAddCashbackT: 'To add',
   promocodeT: 'Promocode' ,
   writeOffT: 'Write off',
   LoyaltySystemT: 'Loyalty programme',
   setPromocodeT: 'Fill in promocode',
   errorT: 'Something went wrong...',
   goToT: 'Go to Account - Orders and pay for your order',
   goToBtnT: 'Go to Account' 
   


   
    
  },
  de: {
    plusT: 'nachtrag 1',
   minusT: 'entfernen 1',
   deleteT: 'element löschen',
   totalT : 'Total:',
    pcsT: 'pcs.',
    addedT: 'hinzugefügt:',
     typeDeliveryT: 'Art der Lieferung',
     chooseTypeT: 'Wählen Sie, wie Sie die Sendung erhalten möchten:',
     infoAboutDeliveryT: 'Zusätzliche Informationen:',
     priceDeliveryT: 'Preis der Lieferung:',
      nextBtn: 'Arrangement',
      itemAdded: 'Artikel hinzugefügt',
    payBtn: 'Zahlbar an',
    payBtn2T : 'Bezahlen',
    headerT: 'Informationen zur Lieferung',
    header2T: 'Zahlungsinformationen',
    selectCountryT: 'Land auswählen',
    addressT: 'Adresse',
    adressInputT: 'ihre adresse',
    nameT: 'Name',
    nameInputT: 'ihr name',
    phoneT: 'Telefon',
    phoneInputT: 'ihre telefonnummer',
    qtyT: 'Betrag:',
    priceGoodT: 'Artikelpreis:',
    itogoT: 'Gesamtbetrag',
    successT: 'Die Bestellung wurde erfolgreich aufgegeben!',
     infoT: 'Sie können Ihre Bestellinformationen im Bereich Konto > Bestellungen“ verfolgen',
     myOrderT: 'Meine Bestellungen',
     emptyCartT: 'Der warenkorb ist leer',
     toCatalogT: 'Katalogisieren',
     enterPromocodeT: 'Promocode verwenden',
     promocodePlaceholderT: 'promocode eingeben',
     applyT: 'anwenden',
     useCashbackT: 'Sie haben:',
       cashbackPlaceholderT: 'menge eingeben',
       writeoffT: 'abschreiben',
       zeroCashbackT: 'Sie haben derzeit 0 cashback-punkte',
       zeroCashbackInfoT: 'Wir schreiben Ihnen nach diesem Kauf Cashback-Punkte gut',
       availableCashbackT: 'verfügbar',
       willAddWhenPurchaseT: 'wird beim Kauf hinzugefügt',
       toAddCashbackT: 'Hinzufügen',
       promocodeT: 'Promo-code',
       writeOffT: 'Abschreiben',
       LoyaltySystemT: 'Treueprogramm',
       setPromocodeT: 'Promocode eingeben',
       errorT: 'Etwas ist schiefgelaufen...',
       goToT: 'Gehen Sie zum Abschnitt Konto – Bestellungen und bezahlen Sie Ihre Bestellung',
       goToBtnT: 'Gehen Sie zu Konto' 
   
    
      
  },
};


  