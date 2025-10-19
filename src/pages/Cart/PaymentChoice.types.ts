export interface CartItem {
  itemId: string;
  priceToShow: number;
  priceToShowNoPromoApplied?: number;
  qty: number;
  valuteToShow: string;
  name_ru?: string;
  name_en: string;
  name_de?: string;
  isSaleNow?: boolean;
  isWithPromoSale?: boolean;
  isWithCashbackSale?: boolean;
  [key: string]: any; // для deliveryPriceToShow_${region}
}

export interface UIState {
  isLoading: boolean;
  isLoadingSum: boolean;
  isPromocodeLoading: boolean;
  openSnackbar: boolean;
  snackbarMessage: string;
}

export interface CartState {
  cart: CartItem[];
  rebootedCartPrice: CartItem[];
  rebootedTotalCartPrice: number;
  totalOrderSum: number;
  oldTotalOrderSum: number;
  isShowOldTotalOrderSum: boolean;
  valuteToShowOnFront: string;
}

export interface PromocodeState {
  value: string;
  isShowInfoText: boolean;
  infoText: string;
  infoType: 'success' | 'error';
}

export interface CashbackState {
  value: string;
  enteredValue: string;
  currentPercent: number;
  willBeCashbacked: number;
  isRunoutShow: boolean;
  userValute: string;
}

export interface SettingsState {
  selectedTab: number;
  typeLoyaltySystem: 'addCashback' | 'usedPromocode' | 'writeOffCashback';
}

export interface PaymentState {
  ui: UIState;
  cart: CartState;
  promocode: PromocodeState;
  cashback: CashbackState;
  settings: SettingsState;
}

export type PaymentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_SUM'; payload: boolean }
  | { type: 'SET_PROMOCODE_LOADING'; payload: boolean }
  | { type: 'SET_SNACKBAR'; payload: { open: boolean; message: string } }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_TOTAL_ORDER_SUM'; payload: number }
  | { type: 'SET_OLD_TOTAL_ORDER_SUM'; payload: number }
  | { type: 'SET_SHOW_OLD_TOTAL'; payload: boolean }
  | { type: 'SET_VALUTE_TO_SHOW'; payload: string }
  | { type: 'SET_PROMOCODE_VALUE'; payload: string }
  | { type: 'SET_PROMOCODE_INFO'; payload: { text: string; type: 'success' | 'error'; show: boolean } }
  | { type: 'SET_CASHBACK_DATA'; payload: Partial<CashbackState> }
  | { type: 'SET_SELECTED_TAB'; payload: number }
  | { type: 'SET_LOYALTY_TYPE'; payload: SettingsState['typeLoyaltySystem'] }
  | { type: 'RESET_TO_ORIGINAL_CART' }
  | {
      type: 'APPLY_DISCOUNT';
      payload: {
        goods: CartItem[];
        total: number;
        textForUser: string;
        loyaltyType: SettingsState['typeLoyaltySystem'];
      };
    };

export const initialState: PaymentState = {
  ui: {
    isLoading: false,
    isLoadingSum: true,
    isPromocodeLoading: false,
    openSnackbar: false,
    snackbarMessage: '',
  },
  cart: {
    cart: [],
    rebootedCartPrice: [],
    rebootedTotalCartPrice: 0,
    totalOrderSum: 0,
    oldTotalOrderSum: 0,
    isShowOldTotalOrderSum: false,
    valuteToShowOnFront: '',
  },
  promocode: {
    value: '',
    isShowInfoText: false,
    infoText: '',
    infoType: 'error',
  },
  cashback: {
    value: '0',
    enteredValue: '',
    currentPercent: 0,
    willBeCashbacked: 0,
    isRunoutShow: false,
    userValute: '',
  },
  settings: {
    selectedTab: 1,
    typeLoyaltySystem: 'addCashback',
  },
};

export function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };

    case 'SET_LOADING_SUM':
      return { ...state, ui: { ...state.ui, isLoadingSum: action.payload } };

    case 'SET_PROMOCODE_LOADING':
      return { ...state, ui: { ...state.ui, isPromocodeLoading: action.payload } };

    case 'SET_SNACKBAR':
      return {
        ...state,
        ui: { ...state.ui, openSnackbar: action.payload.open, snackbarMessage: action.payload.message },
      };

    case 'SET_CART':
      return { ...state, cart: { ...state.cart, cart: action.payload } };

    case 'SET_TOTAL_ORDER_SUM':
      return { ...state, cart: { ...state.cart, totalOrderSum: action.payload } };

    case 'SET_OLD_TOTAL_ORDER_SUM':
      return { ...state, cart: { ...state.cart, oldTotalOrderSum: action.payload } };

    case 'SET_SHOW_OLD_TOTAL':
      return { ...state, cart: { ...state.cart, isShowOldTotalOrderSum: action.payload } };

    case 'SET_VALUTE_TO_SHOW':
      return { ...state, cart: { ...state.cart, valuteToShowOnFront: action.payload } };

    case 'SET_PROMOCODE_VALUE':
      return { ...state, promocode: { ...state.promocode, value: action.payload } };

    case 'SET_PROMOCODE_INFO':
      return {
        ...state,
        promocode: {
          ...state.promocode,
          infoText: action.payload.text,
          infoType: action.payload.type,
          isShowInfoText: action.payload.show,
        },
      };

    case 'SET_CASHBACK_DATA':
      return { ...state, cashback: { ...state.cashback, ...action.payload } };

    case 'SET_SELECTED_TAB':
      return { ...state, settings: { ...state.settings, selectedTab: action.payload } };

    case 'SET_LOYALTY_TYPE':
      return { ...state, settings: { ...state.settings, typeLoyaltySystem: action.payload } };

    case 'RESET_TO_ORIGINAL_CART':
      return {
        ...state,
        cart: {
          ...state.cart,
          cart: state.cart.rebootedCartPrice,
          totalOrderSum: state.cart.rebootedTotalCartPrice,
          isShowOldTotalOrderSum: false,
        },
        promocode: {
          ...state.promocode,
          value: '',
          isShowInfoText: false,
        },
      };

    case 'APPLY_DISCOUNT':
      return {
        ...state,
        cart: {
          ...state.cart,
          cart: action.payload.goods,
          oldTotalOrderSum: state.cart.totalOrderSum,
          totalOrderSum: action.payload.total,
          isShowOldTotalOrderSum: true,
        },
        promocode: {
          ...state.promocode,
          infoText: action.payload.textForUser,
          infoType: 'success',
          isShowInfoText: true,
        },
        settings: {
          ...state.settings,
          typeLoyaltySystem: action.payload.loyaltyType,
        },
      };

    default:
      return state;
  }
}
