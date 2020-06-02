import axios from "axios";
import IOST from "iost";
import moment from "moment";
import { WithTranslation } from "next-i18next";
import React from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import { closeAlert, setWallet, showErrorMessage, showSuccessMessage, updateMyDealProducts } from "../../store/actions";
import { CONTRACT_ADDRESS, LANGS, STATUS, TABS, API_URL } from "../../utils/constant";
import { chainErrorMessage } from "../../utils/helper";

interface IProps extends WithTranslation {
  errorMessage: string;
  showError: boolean;
  showSuccess: boolean;
  successMessage: string;
  lang: string;
  wallet: string;
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  closeAlert: () => void;
  setWallet: (wallet: string) => void;
}

interface IState {
  products: any[];
}

class History extends React.Component<IProps> {

  public static async getInitialProps(ctx) {
    return {
      namespacesRequired: ["common"],
    };
  }

  public state: IState = {
    products: [],
  };

  constructor(props) {
    super(props);
  }

  public async componentDidMount() {
    this.initIwallet();
  }

  public initIwallet() {
    const timeInterval = setInterval(() => {
      const win = window as any;
      if (win.IWalletJS) {
          win.IWalletJS.enable().then(async (account) => {
          if (account) {
            clearInterval(timeInterval);
            this.props.setWallet(account);
            const res = await axios.get(`${ API_URL }/dealhistory?account=${account}`);
            const products = res.data.data.history;
            // By returning { props: posts }, the Blog component
            // will receive `posts` as a prop at build time
            this.setState({ products });
          }
        });
      }
    }, 1000);
  }

  public render() {
    const { showError, successMessage, showSuccess, errorMessage, t, i18n } = this.props;
    const { products } = this.state;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
    };
    const empty = <p className="mt-10 text-center text-gray-500 text-xs">
      {t("noProduct")}
    </p>;
    return (
      <Layout active={ TABS.my } title={"我的兑换"} withBack={ true } withSearch={false}>
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
        { products && products.length > 0 && <ul className="p-4">
          {products.map((prod, key) => (
              <li key={key} className="rounded overflow-hidden shadow-lg mb-10">
                {/* <img className="w-full" src={ prod.image.url } alt={prod.name}/> */}
                <Slider {...settings}>
                  {prod.images.map((item, index) => (
                    <div key={index}>
                      <img className="w-full" src={item} />
                    </div>
                  ))}
                </Slider>
                <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">
                  <div className="flex justify-between">
                    <div className="font-bold text-xl mb-2">
                      { i18n.language === LANGS.cn ? prod.name : prod.name_en }
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
                      {t("start")}: {moment(prod.startTime).format("YYYY-MM-DD H:mm:ss")}
                    </div>
                    {/* <div className="text-gray-700 mt-1">
                      结束:
                      <span className="ml-1">
                      <CountDownComponent
                        endTime={ new Date(contractProducts[key] ? contractProducts[key].endTime / 1e6 :
                          new Date(prod.startTime).getTime() + prod.duration * 1000) }
                      />
                    </span>
                    </div> */}
                  </div>
                  <p className="text-gray-700 text-sm">
                  { i18n.language === LANGS.cn ? prod.desc : prod.desc_en }
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-200 text-sm">
                  <div className="flex justify-between mt-2 text-gray-700">
                    <div>
                      <span className="w-14 inline-block">{t("dealPrice")}:&nbsp;
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-500">{ prod.price } IOST</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-gray-700">
                    <div>
                      {t("dealTime")}:
                    </div>
                    <div>
                     {moment(prod.time).format("YYYY-MM-DD H:mm:ss")}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-gray-700">{t("dealHash")}: &nbsp;</span>
                    <a className="text-blue-500 hover:text-blue-800" href={ "https://www.iostabc.com/tx/" + prod.hash}>
                      <span>{ prod.hash.slice(0, 8) + "......" + prod.hash.slice(-8) }</span>
                    </a>
                  </div>
                  { prod.receivedTime && <div className="mt-2 flex justify-between text-gray-700">
                    <div>
                      {t("receiveConfirmationTime")}:
                    </div>
                    <div>
                     {moment(prod.receivedTime).format("YYYY-MM-DD H:mm:ss")}
                    </div>
                  </div> }
                  { prod.receivedHash && <div className="mt-2 flex justify-between">
                      <span className="text-gray-700"> {t("receiveConfirmationHash")}: &nbsp;</span>
                      <a className="text-blue-500 hover:text-blue-800"
                      href={ "https://www.iostabc.com/tx/" + prod.receivedHash}>
                        <span>{ prod.receivedHash.slice(0, 8) + "......" + prod.receivedHash.slice(-8) }</span>
                      </a>
                    </div> }
                </div>
                { prod.status === STATUS.success && prod.seller && <div className="px-6 py-4 bg-gray-100 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <div>
                    {t("seller")}:
                    </div>
                    <div>
                    {prod.seller[0].name}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-gray-700">
                    <div>
                    {t("mobile")}:
                    </div>
                    <div>
                    {prod.seller[0].mobile}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-gray-700">
                    <div>
                    {t("wechat")}:
                    </div>
                    <div>
                    {prod.seller[0].wechat}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-gray-700">
                    <div>
                    {t("iostAccount")}:
                    </div>
                    <div className="text-blue-500">
                    {prod.seller[0].iostAccount}
                    </div>
                  </div>
                </div> }
                { prod.status === STATUS.success &&
                  <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded rounded-t-none" onClick={() => { this.receive(prod); }}>
                  {t("receiveConfirm")}
                </button> }
                { prod.status === STATUS.received &&
                  <button className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded rounded-t-none">
                  {t("txCompleted")}
                </button> }
              </li>
            ))}
        </ul> }
        { !products.length && empty }
      </Layout>
    );
  }

  // public pay(prod) {
  //   const win = window as any;
  //   const iost = win.IWalletJS.newIOST(IOST);
  //   const { wallet, t } = this.props;
  //   const that = this;
  //   const tx = iost.callABI(
  //     CONTRACT_ADDRESS,
  //     "payment",
  //     [
  //       prod.pId,
  //       wallet,
  //     ],
  //   );
  //   tx.addApprove("iost", prod.price);
  //   tx.gasLimit = 300000;
  //   iost.signAndSend(tx).on("pending", (trx) => {
  //     console.info(trx);
  //   })
  //   .on("success", (result) => {
  //     // 刷新数据
  //     that.props.showSuccessMessage("支付成功，马上联系卖家发货吧");
  //   })
  //   .on("failed", (failed) => {
  //     that.props.showErrorMessage((failed.message ? failed.message.split("throw")[1] : failed) || failed);
  //   });
  // }

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
      updateMyDealProducts,
    },
    dispatch,
  );
}

function mapStateToProps(state: any) {
  const { lang, dealProducts, wallet, errorMessage, showError, showSuccess, successMessage } = state;
  return { lang, dealProducts, wallet, errorMessage, showError, showSuccess, successMessage };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(History));
