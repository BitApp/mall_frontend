import axios from "axios";
import IOST from "iost";
import moment from "moment";
import { WithTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import React from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
// import "react-responsive-carousel/lib/styles/carousel.min.css";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import { closeAlert, setWallet, showErrorMessage, showSuccessMessage } from "../../store/actions";
import { ACTIONS, API_URL, CHAIN_URL, CONTRACT_ADDRESS, LANGS, SERVER_API_URL, STATUS, TABS } from "../../utils/constant";
import { chainErrorMessage } from "../../utils/helper";

interface IProps extends WithTranslation {
  errorMessage: string;
  showError: boolean;
  showSuccess: boolean;
  successMessage: string;
  product: any;
  lang: string;
  wallet: string;
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  closeAlert: () => void;
  setWallet: (wallet: string) => Promise<void>;
}

class Product extends React.Component<IProps> {

  public static async getInitialProps({ req, store, query }) {
    const isServer = !!req;
    const { dispatch } = store;
    const acceptLang: string = req?.headers["accept-language"] || "";
    let lang = "cn";
    if (isServer) {
      lang = /cn/i.test(acceptLang) ? "cn" : "en";
    }
    dispatch({type: ACTIONS.SET_LANG, payload: { lang }});
    const res = await axios.get(`${isServer ? SERVER_API_URL : API_URL }/products/${query.pid}`);
    const product = res.data;
    // By returning { props: posts }, the Blog component
    // will receive `posts` as a prop at build time
    return {
      namespacesRequired: ["common"],
      product,
    };
  }

  private contractProduct: any;

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
    const { product, wallet, showSuccess, showError, lang, errorMessage, successMessage, t, i18n } = this.props;
    const CountDownComponent = dynamic(() =>
      import("../../components/CountDown"),
      { ssr: false },
    );
    const contractProduct = this.contractProduct;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
    };
    return (
      <Layout active={TABS.no}
      title={ i18n.language === LANGS.cn ? product.name : product.name_en }
      withBack={ true } withSearch={false}>
      { showSuccess &&
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
        </div>
      }
      { showError &&
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
        </div>
      }
      <div className="p-4">
        <Slider {...settings}>
          {product.images.map((item, index) => (
            <div key={index}>
              <img className="w-full" src={item.url} />
            </div>
          ))}
        </Slider>
        <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">
          { i18n.language === LANGS.cn ? product.name : product.name_en }
          </div>
          <div className="mb-4 mt-2 text-sm">
          {
          product.status === STATUS.waiting && <div>
            <div className="inline-block font-semibold text-gray-700">{t("start")}: &nbsp;
            <CountDownComponent endText={t("start")} endTime={new Date(product.startTime).getTime() }/>
            </div><div className="text-gray-700 mt-1">
              {t("end")}:
              <span className="ml-1">
                {moment(new Date(contractProduct ? contractProduct.endTime / 1e6 :
                    new Date(product.startTime).getTime() + product.duration * 1000)).format("YYYY-MM-DD, H:mm:ss") }
              </span>
              </div>
            </div>
          }
          { product.status !== STATUS.waiting &&
            <div>
              <div className="inline-block font-semibold text-gray-700">{t("end")}: {moment(product.startTime).format("YYYY-MM-DD, H:mm:ss")}</div>
              <div className="text-gray-700 mt-1">
                {t("end")}:
                <span className="ml-1">
                  <CountDownComponent endText={t("alreadyEnd")}
                    endTime={ new Date(contractProduct ? contractProduct.endTime / 1e6 :
                      new Date(product.startTime).getTime() + product.duration * 1000) }
                  />
                </span>
              </div>
            </div>
          }
          </div>
          <p className="text-gray-700 text-sm">
            { i18n.language === LANGS.cn ? product.desc : product.desc_en}
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-200 text-sm">
          <div className="flex justify-between text-gray-700">
            <div><span className="w-12 inline-block">
              {t("startPrice")}: </span><span>{product.basePrice} IOST</span>
            </div>
            <div><span className="w-12 inline-block">
              {t("stepPrice")}: </span><span>{product.priceStep} IOST</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-gray-700">
            <div>
              <span className="w-12 inline-block">{t("newestPrice")}:
              </span>
              <a className="text-blue-500">
                {contractProduct ?
                (contractProduct.price * 1 ? contractProduct.price : product.basePrice) :
                product.basePrice} IOST
              </a>
            </div>
            <div>
              <span className="w-12 inline-block">{t("account")}: </span>
              <a className="text-blue-500 hover:text-blue-800">
                {contractProduct ?
                (contractProduct.bidder ? contractProduct.bidder : t("empty")) : t("empty")}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-4">
        { product.status === STATUS.bidding && <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" onClick={() => { this.bid(product); }}>
          {t("bid")}
        </button> }
        { product.status === STATUS.success &&
        contractProduct &&
        contractProduct.bidder === wallet && <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" onClick={() => { this.receive(product); }}>
          {t("receiveConfirm")}
        </button> }
      </div>
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
    const { product } = this.props;
    const result = await axios.post(`${CHAIN_URL}`, {
      by_longest_chain: true,
      id: CONTRACT_ADDRESS,
      key: "product_" + product.id,
      key_fields: [{
        field: "bidder",
        key: "product_" + product.id,
      }, {
        field: "endTime",
        key: "product_" + product.id,
      }, {
        field: "price",
        key: "product_" + product.id,
      }],
    });
    this.contractProduct = {
      bidder: result.data.datas[0],
      endTime:  result.data.datas[1],
      price:  result.data.datas[2],
    };
  }

  /**
   * async bid
   */
  public async bid(item) {
    const win = window as any;
    const iost = win.IWalletJS.newIOST(IOST);
    const { wallet, t } = this.props;
    const that = this;
    if (this.contractProduct) {
      const price = this.contractProduct.price * 1
      ? (this.contractProduct.price * 1 + item.priceStep) : item.basePrice;
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

  public receive(prod) {
    const win = window as any;
    const iost = win.IWalletJS.newIOST(IOST);
    const { wallet, t } = this.props;
    const that = this;
    const tx = iost.callABI(
      CONTRACT_ADDRESS,
      "received",
      [
        prod.pId,
        wallet,
      ],
    );
    tx.gasLimit = 300000;
    iost.signAndSend(tx).on("pending", (trx) => {
      console.info(trx);
    })
    .on("success", (result) => {
      // 刷新数据
      that.props.showSuccessMessage(t("confirmReceiveSuccess"));
    })
    .on("failed", (failed) => {
      that.props.showErrorMessage(chainErrorMessage(failed));
    });
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
    },
    dispatch,
  );
}

function mapStateToProps(state: any) {
  const { lang, wallet, contractProduct, errorMessage, showError, showSuccess, successMessage } = state;
  return { lang, wallet, contractProduct, errorMessage, showError, showSuccess, successMessage };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Product));
