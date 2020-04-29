import axios from "axios";
import { WithTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { SingletonRouter, withRouter } from "next/router";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";
import Slider from "react-slick";
// import "react-responsive-carousel/lib/styles/carousel.min.css";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import { ACTIONS, API_URL, LANGS, SERVER_API_URL, TABS } from "../../utils/constant";

interface IProps extends WithTranslation {
  products: any[];
  wallet: string;
  isLoading: boolean;
  router: SingletonRouter;
  setWallet: (wallet: string) => Promise<void>;
  updateContractProducts: (contractProducts: any[]) => Promise<void>;
}

class Waiting extends React.Component<IProps> {

  public static async getInitialProps({ req, store }) {
    const isServer = !!req;
    const { dispatch } = store;
    dispatch({type: ACTIONS.BUSY});
    const res = await axios.get(`${isServer ? SERVER_API_URL : API_URL }/products?status=waiting`);
    const products = res.data;
    dispatch({type: ACTIONS.UPDATE_PRODUCTS, payload: { products } });
    dispatch({type: ACTIONS.FREE});
    // By returning { props: posts }, the Blog component
    // will receive `posts` as a prop at build time
    return {
      namespacesRequired: ["common"],
      products,
    };
  }

  constructor(props) {
    super(props);
  }

  public render() {
    const { products, router, t, i18n, isLoading } = this.props;
    const CountDownComponent = dynamic(() =>
      import("../../components/CountDown"),
      { ssr: false },
    );
    const empty = <p className="mt-10 text-center text-gray-500 text-xs">
      {t("noProduct")}
    </p>;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
    };
    return (
      <Layout active={TABS.store} title={ t("comingSoon") } withBack={ false } withSearch={ false }>
        { products.length > 0 && <ul className="p-4">
          {products.map((prod, key) => (
            <li key={key} className="rounded overflow-hidden shadow-lg mb-10"
            onClick={ () => router.push("/product?pid=" + prod.id) }>
              <Slider {...settings}>
                {prod.images.map((item, index) => (
                  <div key={index}>
                    <img style={{height: "300px", margin: "0 auto"}} src={ item.url } />
                  </div>
                ))}
              </Slider>
              <div className="px-6 py-4">
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
                <div className="mt-2 text-sm">
                  <div className="inline-block font-semibold text-gray-700">{t("start")}: &nbsp;
                    <CountDownComponent endText={t("start")} endTime={new Date(prod.startTime).getTime() }/>
                  </div>
                </div>
                <div className="text-blue-500 text-sm mt-1 mb-4">
                  {t("viewDetail")}
                </div>
                <p className="text-gray-700 text-sm">
                  { i18n.language === LANGS.cn ? prod.desc : prod.desc_en}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-200 text-sm">
                <div className="flex justify-between text-gray-700">
                  <div><span className="w-12 inline-block">
                    {t("startPrice")}: </span><span>{prod.basePrice} IOST</span> </div>
                  <div><span className="w-12 inline-block">
                    {t("stepPrice")}: </span><span>{prod.priceStep} IOST</span></div>
                </div>
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
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(
    {
    },
    dispatch,
  );
}

function mapStateToProps(state: any) {
  const { wallet, contractProducts, products, isLoading } = state;
  return { wallet, contractProducts, products, isLoading };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Waiting)));
