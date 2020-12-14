import axios from "axios";
import { WithTranslation } from "next-i18next";
import { SingletonRouter, withRouter } from "next/router";
import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import { API_URL, LANGS, TABS } from "../../utils/constant";
import {CopyToClipboard} from "react-copy-to-clipboard";

interface IProps extends WithTranslation {
  router: SingletonRouter;
}

interface IState {
  maxRound: number;
  pkStr: string;
  pubKey: string;
  replace: boolean;
  result: string;
}

class Guess extends React.Component<IProps> {

  public static async getInitialProps(ctx) {
    return {
      namespacesRequired: ["common"],
    };
  }

  public state: IState = {
    maxRound: 1,
    pkStr: "",
    pubKey: "",
    replace: false,
    result: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      maxRound: 1,
      pkStr: "",
      pubKey: "",
      replace: false,
      result: "",
    };
  }

  public render() {
    const { router, i18n, t } = this.props;
    const { result, maxRound, pkStr, pubKey, replace } = this.state;
    return (
      <Layout active={ TABS.no } title={"找回私钥"} withBack={ false } withSearch={false}>
        <div className="px-4 pt-4">
          <input onChange={(evt) => {
            this.setState({
              pkStr: evt.target.value.trim(),
            });
          }} className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" placeholder="现有私钥"/>
          <input onChange={(evt) => {
            this.setState({
              pubKey: evt.target.value.trim(),
            });
          }} className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal mt-2" placeholder="公钥"/>
          <div className="mt-2">
            <input onChange={(evt) => {
            this.setState({
              replace: evt.target.checked,
            });
          }} type="checkbox" className="ml-2"/>
            <label className="ml-2">替换
              <span className="text-gray-600 text-sm">(选中会替换当前私钥中的某一位(用于记错的情况)，不选则会新插入一位(用于漏记的情况))</span>
            </label>
          </div>
          <input onChange={(evt) => {
            this.setState({
              maxRound: Number(evt.target.value),
            });
          }} type="number" className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal mt-2" placeholder="替换/插入 位数"/>
          <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
            <div className="flex rounded-md shadow">
              <button onClick={async () => {
                this.setState({
                  result: "计算中...",
                });
                const res = await axios.post(`${API_URL }/guess`, {
                  maxRound,
                  pkStr,
                  pubKey,
                  replace,
                }, {
                  timeout: 1000 * 60 * 100,
                });
                this.setState({
                  result: (res.data.data ?? res.data.msg),
                });
              }} className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                开始
              </button>
            </div>
          </div>
          <div className="mt-4 break-all">{ result }</div>
          <CopyToClipboard text={result}
            onCopy={() => { alert("已复制"); }}>
            <button className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ml-2">复制</button>
          </CopyToClipboard>
        </div>
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
  const { } = state;
  return { };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(Guess)));
