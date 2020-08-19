import axios from "axios";
import moment from "moment";
import { WithTranslation } from "next-i18next";
import { SingletonRouter, withRouter } from "next/router";
import React from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import { API_URL, LANGS, TABS } from "../../utils/constant";

interface IProps extends WithTranslation {
  router: SingletonRouter;
  lang: LANGS;
}

interface IState {
  stores: any[];
}

class Search extends React.Component<IProps, IState> {

  public static async getInitialProps() {
    // By returning { props: posts }, the Blog component
    // will receive `posts` as a prop at build time
    return {
      namespacesRequired: ["common"],
    };
  }

  private productName: string = "";
  private searchTime: NodeJS.Timeout | null;

  constructor(props) {
    super(props);
    this.state = {
      stores: [],
    };
    this.searchTime = null;
  }

  public render() {
    const { router, t, i18n } = this.props;
    const { stores } = this.state;
    const empty = <p className="mt-10 text-center text-gray-500 text-xs">
      {t("noProduct")}
    </p>;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
    };
    return (
      <Layout active={ TABS.no } title={t("search")} withBack={ true } withSearch={ false }>
        <div className="py-2 px-4">
          <input onChange={ (val) => this.search(val) }
          className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
          placeholder="店铺或商品名称"></input>
          { stores.length > 0 && <ul className="pt-4 mt-2">
            {
              stores.map((store, key) => (
              <li key={key} className="rounded overflow-hidden shadow-lg mb-10"
              onClick={ () => router.push("/store/" + store.owner) }>
                <div>
                  <img className="w-full" src={store.imgs[0]} alt={store.name}/></div>
                  <div className="px-6 py-4 text-gray-700">
                    <div className="mt-1 font-semibold">{store.name}</div>
                    <div>
                      <span className="w-12 inline-block text-sm">简介:</span>
                      <div className="mt-1 text-sm text-gray-600">{store.desc}</div>
                    </div>
                  </div>
                  {store.products.length > 0 && (<div><div className="border-t mb-4 mx-2"></div><ul className="px-4">
                    {store.products.map((prod, prodKey) => (
                      <li key={prodKey} className="overflow-hidden flex justify-between mb-2">
                        {prod.imgs.map((item, index) => (
                          <div key={index}>
                            <img style={{height: "4rem", width: "4rem"}} src={item}/>
                          </div>
                        ))}
                        <div className="w-48">
                          <div>
                            <div className="font-bold mb-1">
                              {i18n.language === LANGS.cn ? prod.name : prod.name}
                            </div>
                            <div className="text-gray-600 text-sm leading-4">
                              {i18n.language === LANGS.cn ? prod.desc : prod.desc}
                            </div>
                          </div>
                          <div className="flex justify-between text-gray-800 mt-2">
                            <div><span className="w-12 inline-block">价格:</span></div>
                            <div>{prod.price} <span className="font-semibold">{prod.token}</span></div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul></div>)}
              </li>
            ))}
          </ul> }
        </div>
        { !stores.length && empty}
      </Layout>
    );
  }

  public async search(evt) {
    this.productName = evt.target.value;
    if (this.searchTime) {
      window.clearTimeout(this.searchTime);
    }
    this.searchTime = setTimeout(async () => {
      if (this.productName) {
        const res: any = await axios.get(`${API_URL }/products?search=${ this.productName }`);
        this.setState({
          stores: res.data.data,
        });
      } else {
        this.setState({stores: []});
      }
    }, 600);
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
  const { lang } = state;
  return { lang };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Search)));
