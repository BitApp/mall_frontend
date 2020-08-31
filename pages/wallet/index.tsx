import { WithTranslation } from "next-i18next";
import IOST from "iost";
import { SingletonRouter, withRouter } from "next/router";
import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import {
  setWallet,
} from "../../store/actions";
import { LANGS, TABS } from "../../utils/constant";

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

interface IState {
  balances: number[];
  tokens: string[];
  decimals: number[];
}

class Wallet extends React.Component<IProps> {

  public static async getInitialProps(ctx) {
    return {
      namespacesRequired: ["common"],
    };
  }

  public state: IState = {
    balances: [],
    decimals: [],
    tokens: [],
  };

  constructor(props) {
    super(props);
  }

  public componentDidMount() {
    this.initIwallet();
  }

  public render() {
    const { router, i18n, t } = this.props;
    const { tokens, balances, decimals } = this.state;
    return (
      <Layout active={ TABS.my } title={ "钱包" } withBack={ true } withSearch={false}>
        <ul className="p-4">
          {
            tokens.map((item, index) => {
              return (<li>
                <div key={index} className="bg-white shadow-sm text-gray-600 py-2 px-4 rounded flex justify-between items-center w-full">
                  <span>
                    <img className="inline align-middle" width="36" src={require("../../imgs/icon_iost.svg")}/>
                    <span className="align-middle ml-2">{item}</span>
                  </span>
                  { balances[index] &&
                  <span>{(balances[index] / Math.pow(10, decimals[index] || 1)).toFixed(2)}</span> }
                </div>
              </li>);
            })
          }
        </ul>
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
            const iost = win.IWalletJS.newIOST(IOST);
            iost.rpc.blockchain.getBatchContractStorage = async function(contractID, key, keyFields, pending = true) {
              const query = {
                id: contractID,
                key,
                key_fields: keyFields,
                by_longest_chain: pending,
              }
              const api = "getBatchContractStorage";
              return await this._provider.send("post", api, query);
            };
            iost.rpc.blockchain.getContractStorageFields("token.iost", "TB" + account).then((res) => {
              this.setState({tokens: res.fields});
              iost.rpc.blockchain.getBatchContractStorage("token.iost", null, res.fields.map((tokenItem) => {
                return {
                  field: tokenItem,
                  key: "TB" + account,
                };
              })).then((res2) => {
                this.setState({balances: res2.datas});
              });
              iost.rpc.blockchain.getBatchContractStorage("token.iost", null, res.fields.map((tokenItem) => {
                return {
                  field: "decimal",
                  key: "TI" + tokenItem,
                };
              })).then((res2) => {
                this.setState({decimals: res2.datas});
              });
            });
          }
        });
      }
    }, 1000);
  }
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(
    {
      setWallet,
    },
    dispatch,
  );
}

function mapStateToProps(state: any) {
  const { wallet } = state;
  return { wallet };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Wallet)));
