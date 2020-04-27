import { ACTIONS } from "../utils/constant";

const initialState = {
  biddingProducts: [],
  contractProducts: [],
  dealProducts: [],
  errorMessage: "",
  isLoading: false,
  lang: "cn",
  products: [],
  searchProducts: [],
  showError: false,
  showSuccess: false,
  successMessage: "",
  wallet: "",
};

// store/index.ts
import { Action } from "redux";

interface IAuctionAction extends Action<ACTIONS> {
  payload: any;
}

export const reducer = (state = initialState, action: IAuctionAction) => {
  if (action.type === ACTIONS.SET_LANG) {
    const lang = /cn/i.test(action.payload.lang) ? "cn" : "en";
    return {
      ...state,
      lang,
    };
  } else if (action.type === ACTIONS.BUSY) {
    return {
      ...state,
      isLoading: true,
    };
  }  else if (action.type === ACTIONS.FREE) {
    return {
      ...state,
      isLoading: false,
    };
  } else if (action.type === ACTIONS.SET_WALLET) {
    return {
      ...state,
      wallet: action.payload.wallet,
    };
  } else if (action.type === ACTIONS.UPDATE_CONTRACT_PRODUCTS) {
    return {
      ...state,
      contractProducts: action.payload.contractProducts,
    };
  } else if (action.type === ACTIONS.UPDATE_PRODUCTS) {
    return {
      ...state,
      products: action.payload.products,
    };
  } else if (action.type === ACTIONS.UPDATE_DEAL_PRODUCTS) {
    return {
      ...state,
      dealProducts: action.payload.dealProducts,
    };
  } else if (action.type === ACTIONS.UPDATE_BIDDING_PRODUCTS) {
    return {
      ...state,
      biddingProducts: action.payload.biddingProducts,
    };
  } else if (action.type === ACTIONS.UPDATE_SEARCH_PRODUCT) {
    return {
      ...state,
      searchProducts: action.payload.searchProducts,
    };
  } else if (action.type === ACTIONS.SHOW_ERROR_MESSAGE) {
    return {
      ...state,
      errorMessage: action.payload.message,
      showError: true,
    };
  } else if (action.type === ACTIONS.SHOW_SUCCESS_MESSAGE) {
    return {
      ...state,
      showSuccess: true,
      successMessage: action.payload.message,
    };
  }  else if (action.type === ACTIONS.CLOSE_ALERT) {
    return {
      ...state,
      showError: false,
      showSuccess: false,
    };
  } else {
    return state;
  }
};

export type RootState = ReturnType<typeof reducer>;
