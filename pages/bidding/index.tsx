import axios from "axios";
import moment from "moment";
import { WithTranslation } from "next-i18next";
import React from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import { setWallet, updateMyBiddingProducts } from "../../store/actions";
import { LANGS, TABS, WEB_API_URL } from "../../utils/constant";

interface IProps extends WithTranslation {
  biddingProducts: any[];
  lang: string;
  wallet: string;
  setWallet: (wallet: string) => void;
  updateMyBiddingProducts: (biddingProducts: any[]) => void;
}

class Bidding extends React.Component<IProps> {

  public static async getInitialProps(ctx) {
    return {
      namespacesRequired: ["common"],
    };
  }

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
            const res = await axios.get(`${ WEB_API_URL }/bidding?account=${account}`);
            const products = res.data.data;
            // By returning { props: posts }, the Blog component
            // will receive `posts` as a prop at build time
            this.props.updateMyBiddingProducts(products);
          }
        });
      }
    }, 1000);
  }

  public render() {
    const { biddingProducts, t, i18n } = this.props;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
    };
    const empty = <p className="mt-10 text-center text-gray-500 text-xs">
      {t("noProduct")}
    </p>;
    // const CountDownComponent = dynamic(() =>
    //   import("../../components/CountDown"),
    //   { ssr: false },
    // );
    return (
      <Layout active={ TABS.myauction } title={t("alreadyBid")} withBack={ true } withSearch={false}>
        { biddingProducts && biddingProducts.length > 0 && <ul className="p-4">
          {biddingProducts.map((prod, key) => (
              prod.product && <li key={key} className="rounded overflow-hidden shadow-lg mb-10">
                <Slider {...settings}>
                  {prod.product.images.map((item, index) => (
                    <div key={index}>
                      <img className="w-full" src={item} />
                    </div>
                  ))}
                </Slider>
                <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">
                  <div className="flex justify-between">
                    <div className="font-bold text-xl mb-2">
                    { i18n.language === LANGS.cn ? prod.product.name : prod.product.name_en }
                    </div>
                    <div>
                      {
                        prod.product.types.map((item, index) => {
                        return <span className="mr-1 text-xs text-gray-500" key={index}>
                          {i18n.language === LANGS.cn ? t(item.type) : item.type}
                          </span>;
                        })
                      }
                    </div>
                  </div>
                </div>
                  {/* <div className="mb-4 mt-2 text-sm">
                    <div className="inline-block font-semibold text-gray-700">起拍: &nbsp;{moment(prod.startTime).format("YYYY-MM-DD H:mm:ss")}</div>
                  </div> */}
                  <p className="text-gray-700 text-sm">
                    {i18n.language === LANGS.cn ? prod.product.desc : prod.product.desc_en}
                  </p>
                </div>
                <div className="px-6 py-4 text-sm bg-gray-100">
                  <div className="flex justify-between text-gray-700">
                    <div>
                      <span className="w-12 inline-block">{t("startPrice")}: </span>
                      <span>{prod.product.basePrice} IOST</span>
                    </div>
                    <div>
                      <span className="w-12 inline-block">{t("stepPrice")}: </span>
                      <span>{prod.product.priceStep} IOST</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-2 bg-gray-200 text-sm">
                  <div className="flex justify-between mt-2 text-gray-700">
                    <div>
                      <span className="w-14 inline-block">{t("bidPrice")}:&nbsp;
                        <span className="text-blue-500">{prod.price } IOST</span>
                      </span>
                    </div>
                    <div>
                      <span className="w-14 inline-block">{ moment(prod.time).format("YYYY-MM-DD H:mm:ss") }</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-gray-700">
                    <div>
                      <span className="w-14 inline-block">Hash: </span>
                    </div>
                    <div>
                      <a className="text-blue-500 hover:text-blue-800"
                      href={ "https://www.iostabc.com/tx/" + prod.hash}>
                        <span>{ prod.hash.slice(0, 8) + "......" + prod.hash.slice(-8) }</span>
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul> }
        { !biddingProducts.length && empty}
      </Layout>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(
    {
      setWallet,
      updateMyBiddingProducts,
    },
    dispatch,
  );
}

function mapStateToProps(state: any) {
  const { lang, biddingProducts, wallet } = state;
  return { lang, biddingProducts, wallet };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Bidding));
