import axios from "axios";
import { WithTranslation } from "next-i18next";
import { SingletonRouter, withRouter } from "next/router";
import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import Layout from "../../components/Layout";
import { withTranslation } from "../../i18n";
import { API_URL, LANGS, TABS } from "../../utils/constant";
import classnames from "classnames";
import {CopyToClipboard} from "react-copy-to-clipboard";

interface IProps extends WithTranslation {
  router: SingletonRouter;
}

interface IState {
  isCalcing: boolean;
  maxRound: number;
  pkStr: string;
  pubKey: string;
  replace: string;
  result: string;
  status: any;
}

class Guess extends React.Component<IProps> {

  public static async getInitialProps(ctx) {
    return {
      namespacesRequired: ["common"],
    };
  }

  public id: NodeJS.Timeout | undefined;

  public state: IState = {
    isCalcing: true,
    maxRound: 1,
    pkStr: "",
    pubKey: "",
    replace: "",
    result: "",
    status: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      isCalcing: true,
      maxRound: 1,
      pkStr: "",
      pubKey: "",
      replace: "",
      result: "",
      status: {},
    };
  }

  public async updateProgress() {
    const res = await axios.get(`${API_URL }/guess/progress`);
    if (res.data.data) {
      this.setState({
        status: res.data.data,
      });
      this.setState({
        isCalcing: true,
      });
    } else {
      this.setState({
        isCalcing: false,
        status: {
          params: this.state.status.params,
        },
      });
    }
  }

  public componentWillUnmount() {
    if (this.id) {
      window.clearTimeout(this.id);
    }
  }

  public componentDidMount() {
    this.updateProgress();

    this.id = setInterval(() => {
      this.updateProgress();
    }, 10000);
  }

  public render() {
    const { router, i18n, t } = this.props;
    const { isCalcing, result, maxRound, pkStr, pubKey, replace, status } = this.state;
    return (
      <Layout active={ TABS.no } title={"找回私钥"} withBack={ false } withSearch={false}>
        <div className="px-4 pt-4">
          <input defaultValue={status.params ? status.params.pkStr : ""} onChange={(evt) => {
            this.setState({
              pkStr: evt.target.value.trim(),
            });
          }} className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" placeholder="现有私钥"/>
          <input defaultValue={status.params ? status.params.pubKey : ""} onChange={(evt) => {
            this.setState({
              pubKey: evt.target.value.trim(),
            });
          }} className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal mt-2" placeholder="公钥"/>
          <input defaultValue={status.params ? status.params.maxRound : ""} onChange={(evt) => {
            this.setState({
              maxRound: Number(evt.target.value),
            });
          }} type="number" className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal mt-2" placeholder="替换/插入 位数"/>
          <div className="mt-2">
            <input defaultValue={status.params ? status.params.replaceArr.join(",") : ""} onChange={(evt) => {
            this.setState({
              replace: evt.target.value,
            });
          }} type="text" placeholder="替换(1)或者插入(0)的, 第一位插入第二位替换：0,1" className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal mt-2"/>
          </div>
          <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
            <div className="flex rounded-md shadow">
              <button disabled={isCalcing} onClick={async () => {
                if (!isCalcing) {
                  await axios.post(`${API_URL }/guess`, {
                    maxRound: (maxRound || status.params.maxRound),
                    pkStr: (pkStr || status.params.pkStr),
                    pubKey: (pubKey || status.params.pubKey),
                    replace: (replace || status.params.pubKey),
                  }, {
                    timeout: 1000 * 60 * 100,
                  });
                  setTimeout(async () => {
                    await this.updateProgress();
                  }, 1000);
                }
              }} className={classnames("w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700", isCalcing ? "opacity-50" : "")}>
                开始
              </button>
              <button disabled={!isCalcing} onClick={async () => {
                await axios.get(`${API_URL }/guess/terminate`);
                setTimeout(async () => {
                  await this.updateProgress();
                }, 1000);
              }} className={classnames("w-full ml-4 flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700", !isCalcing ? "opacity-50" : "")}>
                终止
              </button>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 lg:flex-shrink-0">
            <div className="flex rounded-md shadow">
              <button onClick={async () => {
                await this.updateProgress();
              }} className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                更新进度
              </button>
            </div>
          </div>
          <div className="mt-4 break-all">
            <div className="text-gray-600">
              { status.progress ? JSON.stringify(status.progress, null, 4) : "" }
            </div>
            {status.progress && <CopyToClipboard text={JSON.stringify(status.progress, null, 4)}
            onCopy={() => { alert("已复制"); }}>
            <button className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 mt-2">复制</button>
            </CopyToClipboard> }
          </div>
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
