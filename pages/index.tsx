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
import Tips from "../components/Tips";
import { withTranslation } from "../i18n";
import {
  closeAlert,
  setWallet,
  showErrorMessage,
  showSuccessMessage,
  updateContractProducts,
  updateProducts,
} from "../store/actions";
import { ACTIONS, API_URL, CHAIN_URL, CONTRACT_ADDRESS, LANGS, SERVER_API_URL, TABS } from "../utils/constant";
import { chainErrorMessage } from "../utils/helper";
import { withRouter, SingletonRouter } from "next/router";

interface IProps extends WithTranslation {
  errorMessage: string;
  showError: boolean;
  showSuccess: boolean;
  successMessage: string;
  stores: any[];
  isLoading: boolean;
  wallet: string;
  router: SingletonRouter;
  setWallet: (wallet: string) => Promise<void>;
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  closeAlert: () => void;
}

class Index extends React.Component<IProps> {

  public static async getInitialProps(ctx) {
    const isServer = !!ctx.req;
    const { dispatch } = ctx.store;
    dispatch({type: ACTIONS.BUSY});
    const res = await axios.get(`${isServer ? SERVER_API_URL : API_URL }/stores?recommand=1`);
    const stores = res.data.data.stores;
    // By returning { props: posts }, the Blog component
    // will receive `posts` as a prop at build time
    dispatch({type: ACTIONS.FREE});
    return {
      namespacesRequired: ["common"],
      stores,
    };
  }

  constructor(props) {
    super(props);
  }

  public componentDidMount() {
    this.initIwallet();
  }

  public render() {
    const {
      stores,
      showSuccess,
      showError,
      errorMessage,
      successMessage,
      router,
      t,
      i18n,
      isLoading } = this.props;
    const CountDownComponent = dynamic(() =>
        import("../components/CountDown"),
      {ssr: false},
    );
    const empty = <p className="mt-10 text-center text-gray-500 text-xs">
      暂无小店
    </p>;
    return (
      <Layout active={TABS.recommend} title={t("store")} withBack={ false } withSearch={true}>
        <Tips/>
        { stores.length > 0 &&
        <ul className="p-4">
          {stores.map((item, key) => (
            <li key={key} className="rounded-md overflow-hidden shadow-lg mb-10" onClick={ () => {
              router.push(`/store/${item.name}`);
            }}>
              <div><img className="w-full" src={ item.store.imgs[0] } alt={item.store.name}/></div>
              <div className="px-6 py-4 text-gray-700">
                <div className="mt-1">{item.store.name}</div>
                <div className="mt-2">代币: {item.token ? item.token.symbol: null}</div>
                <div className="mt-2">代币: {item.token ? item.token.symbol: null}</div>
                {
                  item.recommendStartTime === 0 ?
                    <div>
                      <span>推荐倒计时:</span>
                      <CountDownComponent endText={'推荐结束'} endTime={item.recommendStartTime}/>
                    </div>
                    : null
                }
              </div>
            </li>
          ))}
        </ul> }
        { !isLoading && !stores.length && empty}
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
  const { wallet, contractProducts, errorMessage, showError, showSuccess, successMessage, isLoading } = state;
  return { wallet, contractProducts, errorMessage, showError, showSuccess, successMessage, isLoading };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Index)));
