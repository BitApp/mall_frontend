export enum TABS {
  onsale,
  waiting,
  myauction,
  no,
}

export enum CATEGORIES {
  all = "all",
  electronic = "electronic",
  digital = "digital",
  art = "art",
  makeup = "makeup",
  dress = "dress",
  bag = "bag",
  import = "import",
  book = "book",
  knowledge = "knowledge",
  others = "others",
}

export const CATEGORIES_ARRAY = [
  CATEGORIES.all,
  CATEGORIES.electronic,
  CATEGORIES.digital,
  CATEGORIES.art,
  CATEGORIES.makeup,
  CATEGORIES.dress,
  CATEGORIES.bag,
  CATEGORIES.import,
  CATEGORIES.book,
  CATEGORIES.knowledge,
  CATEGORIES.others,
];

export const API_URL: string = "/api";
export const SERVER_API_URL: string = "http://127.0.0.1:1337/api";
export const WEB_API_URL: string = "https://testauction.bitapp.net/webapi";
export const CHAIN_URL: string = "https://www.iostabc.com/endpoint/getBatchContractStorage";
export const CONTRACT_ADDRESS: string = "ContractCnVcjzfbxmPVi9DhLyrG2KTc1vknTp8bhmtkVrJ1354Y";

export enum ACTIONS {
  BUSY = "BUSY",
  FREE = "FREE",
  CLOSE_ALERT = "CLOSE_ALERT",
  SHOW_ERROR_MESSAGE = "SHOW_ERROR_MESSAGE",
  SHOW_SUCCESS_MESSAGE = "SHOW_SUCCESS_MESSAGE",
  SET_LANG = "SET_LANG",
  SET_WALLET = "SET_WALLET",
  UPDATE_PRODUCTS = "UPDATE_PRODUCTS",
  UPDATE_CONTRACT_PRODUCTS = "UPDATE_CONTRACT_PRODUCTS",
  UPDATE_DEAL_PRODUCTS = "UPDATE_DEAL_PRODUCTS",
  UPDATE_BIDDING_PRODUCTS = "UPDATE_BIDDING_PRODUCTS",
  UPDATE_SEARCH_PRODUCT = "UPDATE_SEARCH_PRODUCT",
}

export enum LANGS {
  en = "en",
  cn = "cn",
}

export enum STATUS {
  offline = "offline",
  waiting = "waiting",
  bidding = "bidding",
  failed = "failed",
  success = "success",
  closed = "closed",
  received = "received",
}
