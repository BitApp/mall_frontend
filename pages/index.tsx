import axios from "axios";
import IOST from "iost";
import moment from "moment";
import { WithTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";
import Slider from "react-slick";
// import "react-responsive-carousel/lib/styles/carousel.min.css";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../components/Layout";
import { withTranslation } from "../i18n";
import {
  busy,
  closeAlert,
  free,
  setWallet,
  showErrorMessage,
  showSuccessMessage,
  updateContractProducts,
  updateProducts,
} from "../store/actions";
import { ACTIONS, API_URL, CHAIN_URL, CONTRACT_ADDRESS, LANGS, SERVER_API_URL, TABS } from "../utils/constant";
import { chainErrorMessage } from "../utils/helper";

interface IProps extends WithTranslation {
  errorMessage: string;
  showError: boolean;
  showSuccess: boolean;
  successMessage: string;
  products: any[];
  isLoading: boolean;
  wallet: string;
  contractProducts: any[];
  setWallet: (wallet: string) => Promise<void>;
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  closeAlert: () => void;
  updateContractProducts: (contractProducts: any[]) => Promise<void>;
  updateProducts: (products: any[]) => Promise<void>;
}

class Index extends React.Component<IProps> {

  public static async getInitialProps(ctx) {
    const isServer = !!ctx.req;
    const { dispatch } = ctx.store;
    dispatch({type: ACTIONS.BUSY});
    const res = await axios.get(`${isServer ? SERVER_API_URL : API_URL }/products?status=bidding`);
    const products = res.data;
    // By returning { props: posts }, the Blog component
    // will receive `posts` as a prop at build time
    dispatch({type: ACTIONS.UPDATE_PRODUCTS, payload: { products }});
    dispatch({type: ACTIONS.FREE});
    return {
      namespacesRequired: ["common"],
      products,
    };
  }

  constructor(props) {
    super(props);
  }

  public componentDidMount() {
    this.initIwallet();
    this.refreshChainInfo();
    setInterval( () => {
      this.refreshChainInfo();
    }, 60 * 1000);
  }

  public render() {
    const {
      products,
      contractProducts,
      showSuccess,
      showError,
      errorMessage,
      successMessage,
      t,
      i18n,
      isLoading } = this.props;

    const CountDownComponent = dynamic(() =>
      import("../components/CountDown"),
      { ssr: false },
    );
    const empty = <p className="mt-10 text-center text-gray-500 text-xs">
      { t("noProductOnSale") }
    </p>;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
    };
    return (
      <Layout active={TABS.onsale} title={t("store")} withBack={ false } withSearch={true}>
        {showSuccess &&
        <div className="z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed mx-4 left-0 right-0 mt-4" role="alert">
          <span className="block sm:inline">{ successMessage }</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => { this.closeAlert(); }}>
            <svg
            className="fill-current h-6 w-6 text-green-500"
            role="button" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>}
        {showError &&
        <div
        className="z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed mx-4 left-0 right-0 mt-4"
        role="alert">
          <span className="block sm:inline">{ errorMessage }</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => { this.closeAlert(); }}>
            <svg
            className="fill-current h-6 w-6 text-red-500"
            role="button" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>}
        { products.length > 0 &&
        <ul className="p-4">
          {products.map((prod, key) => (
            <li key={key} className="rounded overflow-hidden shadow-lg mb-10">
              {/* <img className="w-full" src={ prod.image.url } alt={prod.name}/> */}
              <Slider {...settings}>
                {prod.images.map((item, index) => (
                  <div key={index}>
                    <img style={{height: "300px", margin: "0 auto"}} src={item.url} />
                  </div>
                ))}
              </Slider>
              <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">
                <div className="flex justify-between">
                  <div className="font-bold text-xl mb-2">
                    { i18n.language === LANGS.cn ? prod.name : prod.name_en}
                  </div>
                  <div>
                    {
                      prod.types.map((item, index) => {
                      return <span className="mr-1 text-xs text-gray-500" key={index}>
                        {i18n.language === LANGS.cn ? t(item.type) : item.type}
                        </span>;
                      })
                    }
                  </div>
                </div>
              </div>
                <div className="mb-4 mt-2 text-sm">
                  <div className="inline-block font-semibold text-gray-700">
                    {t("start")}: {moment(prod.startTime).format("YYYY-MM-DD, H:mm:ss")}
                  </div>
                  <div className="text-gray-700 mt-1">
                    {t("end")}:
                    <span className="ml-1">
                      <CountDownComponent endText={t("alreadyEnd")}
                        endTime={ new Date(contractProducts[key] ? contractProducts[key].endTime / 1e6 :
                          new Date(prod.startTime).getTime() + prod.duration * 1000) }
                      />
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  {i18n.language === LANGS.cn ? prod.desc : prod.desc_en}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-200 text-sm">
                <div className="flex justify-between text-gray-700">
                  <div>
                    <span className="w-12 inline-block">
                      {t("startPrice")}: </span><span>{prod.basePrice} IOST</span>
                  </div>
                  <div>
                    <span className="w-12 inline-block">
                    {t("stepPrice")}: </span><span>{prod.priceStep} IOST</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-gray-700">
                  <div>
                    <span className="w-12 inline-block">{t("newestPrice")}:
                    </span>
                    <a className="text-blue-500">
                      {contractProducts[key] ?
                      (contractProducts[key].price * 1 ? contractProducts[key].price : prod.basePrice) :
                      prod.basePrice} IOST
                    </a>
                  </div>
                  <div>
                    <span className="w-12 inline-block">{t("account")}: </span>
                    <a className="text-blue-500 hover:text-blue-800">
                      {contractProducts[key] ?
                      (contractProducts[key].bidder ? contractProducts[key].bidder : t("empty")) : t("empty")}
                    </a>
                  </div>
                </div>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded rounded-t-none" onClick={() => { this.bid(prod); }}>
                {t("bid")}
              </button>
            </li>
          ))}
        </ul> }
        { !isLoading && !products.length && empty}
        { isLoading && <div className="p-4">
            <Skeleton height={300}/>
            <div className="mt-2">
              <Skeleton width={160} height={24}/>
            </div>
            <div className="mt-2">
              <Skeleton count={4}/>
            </div>
          </div> }
      </Layout>
    );
  }

  public initIwallet() {
    const timeInterval = setInterval(() => {
      const win = window as any;
      if (win.IWalletJS) {
          win.IWalletJS.enable().then((account) => {
          if (account) {
            clearInterval(timeInterval);
            this.props.setWallet(account);
          }
        });
      }
    }, 1000);
  }

  public async refreshChainInfo() {
    const promiseArr: Array<Promise<void>> = [];
    const { products } = this.props;
    products.forEach((item) => {
      // const httpProvider = new IOST.HTTPProvider("https://www.iostabc.com/endpoint");
      // const rpc = new IOST.RPC(httpProvider);
      // rpc.blockchain.getContractStorage(CONTRACT_ADDRESS, "product_" + item.id, true);
      promiseArr.push(axios.post(`${CHAIN_URL}`, {
        by_longest_chain: true,
        id: CONTRACT_ADDRESS,
        key: "product_" + item.id,
        key_fields: [{
          field: "bidder",
          key: "product_" + item.id,
        }, {
          field: "endTime",
          key: "product_" + item.id,
        }, {
          field: "price",
          key: "product_" + item.id,
        }],
      }));
    });
    const arr: any[] = await Promise.all(promiseArr);
    const contractProducts: any[] = [];
    arr.forEach((item) => {
      contractProducts.push({
        bidder: item.data.datas[0],
        endTime: item.data.datas[1],
        price: item.data.datas[2],
      });
    });
    this.props.updateContractProducts(contractProducts);
  }

  /**
   * async bid
   */
  public async bid(item) {
    const win = window as any;
    const iost = win.IWalletJS.newIOST(IOST);
    const { wallet, products, contractProducts, t } = this.props;
    if (contractProducts.length) {
      const that = this;
      const price = contractProducts[products.indexOf(item)].price * 1
      ? (contractProducts[products.indexOf(item)].price * 1 + item.priceStep) : item.basePrice;
      const tx = iost.callABI(
        CONTRACT_ADDRESS,
        "bidding",
        [
          item.id,
          wallet,
          (price).toString(),
        ],
      );
      tx.gasLimit = 300000;
      tx.addApprove("iost", price.toString());
      iost.signAndSend(tx).on("pending", (trx) => {
        console.info(trx);
      })
      .on("success", (result) => {
        // 刷新数据
        that.refreshChainInfo();
        that.props.showSuccessMessage(t("bidSuccess"));
      })
      .on("failed", (failed) => {
        that.props.showErrorMessage(chainErrorMessage(failed));
      });
    }
  }

  public closeAlert() {
    this.props.closeAlert();
  }
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(
    {
      closeAlert,
      setWallet,
      showErrorMessage,
      showSuccessMessage,
      updateContractProducts,
      updateProducts,
    },
    dispatch,
  );
}

function mapStateToProps(state: any) {
  const { wallet, products, contractProducts, errorMessage, showError, showSuccess, successMessage, isLoading } = state;
  return { wallet, products, contractProducts, errorMessage, showError, showSuccess, successMessage, isLoading };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Index));
