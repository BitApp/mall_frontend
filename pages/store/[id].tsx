import axios from "axios";
import IOST from "iost";
import { WithTranslation } from "next-i18next";
import { SingletonRouter, withRouter } from "next/router";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";
import Slider from "react-slick";
// import "react-responsive-carousel/lib/styles/carousel.min.css";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import {
  closeAlert,
  setWallet,
  showErrorMessage,
  showSuccessMessage,
} from "../../store/actions";
import { ACTIONS, API_URL, CONTRACT_ADDRESS, LANGS, SERVER_API_URL, TABS } from "../../utils/constant";
import { chainErrorMessage } from "../../utils/helper";
import Tips from "../../components/Tips";

interface IProps extends WithTranslation {
  id: string;
  errorMessage: string;
  showError: boolean;
  showSuccess: boolean;
  successMessage: string;
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  products: any[];
  storeInfo: any;
  wallet: string;
  isLoading: boolean;
  router: SingletonRouter;
  setWallet: (wallet: string) => Promise<void>;
}

class StoreProduct extends React.Component<IProps> {

  public static async getInitialProps({ req, store, query }) {
    const isServer = !!req;
    const id = query.id;
    const { dispatch } = store;
    dispatch({type: ACTIONS.BUSY});
    const res = await axios.get(`${isServer ? SERVER_API_URL : API_URL }/stores/${id}/products`);
    const products = res.data.data.products;
    const storeInfo = res.data.data.store;
    dispatch({type: ACTIONS.FREE});
    // By returning { props: posts }, the Blog component
    // will receive `posts` as a prop at build time
    return {
      id,
      namespacesRequired: ["common"],
      products,
      storeInfo,
    };
  }

  constructor(props) {
    super(props);
  }

  public render() {
    const { products, t, i18n, isLoading, id } = this.props;
    const empty = <p className="mt-10 text-center text-gray-500 text-xs">
      {t("noProduct")}
    </p>;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
    };
    return (
      <Layout active={TABS.no} title={ id } withBack={ true } withSearch={ false }>
        <Tips/>
        { products.length > 0 && <ul className="p-4">
          <li className="bg-white flex justify-between border mb-10 px-4 py-2 align-middle rounded-md">
            <div className="text-gray-800">
              <div className="leading-8">兑换比例:
              <span className="ml-1 font-semibold">1 <small>IOST</small>:100 <small>HSR</small>
              </span>
              </div>
              <div className="leading-8">兑换余额:
              <span className="font-semibold ml-1">1000 <small>IOST</small></span></div>
            </div>
            <button className="button-bg hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md" type="button">
              兑换
            </button>
          </li>
          { products.map((prod, key) => (
            <li key={key} className="rounded overflow-hidden shadow-lg mb-10">
              <Slider {...settings}>
                {prod.imgs.map((item, index) => (
                  <div key={index}>
                    <img style={{height: "300px", margin: "0 auto"}} src={ item } />
                  </div>
                ))}
              </Slider>
              <div className="px-4 py-4">
                <div className="flex justify-between">
                  <div className="font-bold text-xl mb-2">
                    { i18n.language === LANGS.cn ? prod.name : prod.name}
                  </div>
                  <div>
                    {
                      prod.types.map((item, index) => {
                      return <span className="mr-1 text-xs text-gray-500" key={index}>
                        {i18n.language === LANGS.cn ? t(item.name) : item.name}
                        </span>;
                      })
                    }
                  </div>
                </div>
                <div className="flex justify-between text-gray-800">
                  <div><span className="w-12 inline-block">店铺:</span></div>
                  <div>{id}</div>
                </div>
                <div className="flex justify-between text-gray-800 mt-2">
                  <div><span className="w-12 inline-block">价格:</span></div>
                  <div>{prod.price} {prod.token}</div>
                </div>
              </div>
              <div className="px-4 py-4 bg-gray-100 text-sm">
                <p className="text-gray-600 text-sm">
                  { i18n.language === LANGS.cn ? prod.desc : prod.desc}
                </p>
                <button className="mt-6 w-full button-bg hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md"
                onClick={() => { this.exchange(prod); }}>
                  兑换
                </button>
              </div>
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

  public exchange(prod) {
    const win = window as any;
    const iost = win.IWalletJS.newIOST(IOST);
    const { wallet, t, id, router, storeInfo } = this.props;
    const that = this;
    const tx = iost.callABI(
      CONTRACT_ADDRESS,
      "buyProduct",
      [
        prod.pId,
      ],
    );
    tx.gasLimit = 300000;
    tx.addApprove(prod.token, prod.price.toString());
    iost.signAndSend(tx).on("pending", (trx) => {
      console.info(trx);
    })
    .on("success", () => {
      // 刷新数据
      alert("兑换" + prod.name + "成功, 恭喜您已获得" + prod.name + ", " + "请主动联系卖家发货 " + storeInfo.sellerWechat);
      router.push("/exchange/history");
    })
    .on("failed", (failed) => {
      that.props.showErrorMessage(chainErrorMessage(failed));
    });
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
  const { wallet, errorMessage, showError, showSuccess, successMessage, isLoading } = state;
  return { wallet, errorMessage, showError, showSuccess, successMessage, isLoading };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(StoreProduct)));
