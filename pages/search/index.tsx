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
import { updateSearchProducts } from "../../store/actions";
import { API_URL, CATEGORIES, CATEGORIES_ARRAY, LANGS, TABS } from "../../utils/constant";

interface IProps extends WithTranslation {
  searchProducts: any[];
  router: SingletonRouter;
  lang: LANGS;
  updateSearchProducts: (searchProducts: any[]) => Promise<void>;
}

class Search extends React.Component<IProps> {

  public static async getInitialProps() {
    // By returning { props: posts }, the Blog component
    // will receive `posts` as a prop at build time
    return {
      namespacesRequired: ["common"],
    };
  }

  private productName: string = "";
  private productCate: string = CATEGORIES.all;

  constructor(props) {
    super(props);
  }

  public render() {
    const { searchProducts, router, t, i18n } = this.props;
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
          placeholder={t("productName")}></input>
          <label className="block text-gray-500 text-sm font-bold mb-2 ml-1 mt-2">
          {t("categories")}
          </label>
          <div className="inline-block relative w-full">
            <select value={this.productCate} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline" onChange={(evt) => this.chooseType(evt)}>
              {
                CATEGORIES_ARRAY.map((item, index) => {
                  return <option key={index} value={item}>{i18n.language === LANGS.cn ? t(item) : item}</option>;
                })
              }
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          { searchProducts.length > 0 && <ul className="pt-4">
            {
              searchProducts.map((prod, key) => (
              <li key={key} className="rounded overflow-hidden shadow-lg mb-10"
              onClick={ () => router.push("/product?pid=" + prod.id) }>
                {/* <img className="w-full" src={ prod.image.url } alt={prod.name}/> */}
                <Slider {...settings}>
                  {prod.images.map((item, index) => (
                    <div key={index}>
                      <img className="w-full" src={item.url} />
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
                  <div className=" mt-2 text-sm">
                    <div className="inline-block font-semibold text-gray-700">
                      {t("start")}: {moment(prod.startTime).format("YYYY-MM-DD, H:mm:ss")}</div>
                  </div>
                  <div className="text-blue-500 text-sm mt-1 mb-4">
                    {t("viewDetail")}
                  </div>
                  <p className="text-gray-700 text-sm">
                    { i18n.language === LANGS.cn ? prod.desc : prod.desc_en }
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-200 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <div><span className="w-12 inline-block">
                      {t("startPrice")}: </span><span>{prod.basePrice} IOST</span>
                    </div>
                    <div><span className="w-12 inline-block">{t("stepPrice")}:
                    </span><span>{prod.priceStep} IOST</span></div>
                  </div>
                </div>
              </li>
            ))}
          </ul> }
        </div>
        { !searchProducts.length && empty}
      </Layout>
    );
  }

  public filterCategory(products) {
    if (this.productCate === CATEGORIES.all) {
      return products;
    } else {
      const result = products.filter((item) => {
        const types = item.types;
        return types.find((typeItem) => {
          return typeItem.type === this.productCate;
        });
      });
      return result;
    }
  }

  public async search(evt) {
    this.productName = evt.target.value;
    if (this.productName) {
      const res: any = await axios.get(`${API_URL }/products?name_contains=${ this.productName }`);
      this.props.updateSearchProducts(this.filterCategory(res.data));
    } else {
      this.props.updateSearchProducts([]);
    }
  }

  public async chooseType(evt) {
    this.productCate = evt.target.value;
    if (this.productName) {
      const res: any = await axios.get(`${API_URL }/products?name_contains=${ this.productName }`);
      this.props.updateSearchProducts(this.filterCategory(res.data));
    } else {
      this.props.updateSearchProducts(this.filterCategory([]));
    }
  }
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(
    {
      updateSearchProducts,
    },
    dispatch,
  );
}

function mapStateToProps(state: any) {
  const { lang, searchProducts } = state;
  return { lang, searchProducts };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Search)));
