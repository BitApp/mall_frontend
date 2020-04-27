import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "../i18n";
// import { Link, withTranslation } from "../i18n";
import { TABS } from "../utils/constant";

export default ({ children, active, title, withBack, withSearch}) => {
  const { t } = useTranslation("common");
  const activeClassName = "text-center block border-blue-500 py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white border-b-4 border-blue-700 hover:border-blue-800";
  const normalClassName = "text-center block bg-gray-200 hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-2 px-4 border-b-4 border-gray-400 hover:border-gray-400 border-r";
  const router = useRouter();
  return (
    <div>
      <Head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" rel="stylesheet" />
      </Head>
      <div className="container mb-12">
      <nav className="px-4 py-2 w-full bg-gray-100 clearfix">
        { withBack && <svg viewBox="0 0 20 20"
        className="fill-current h-5 w-5 float-left" onClick={ () => { router.back(); } }>
            <path fill="#718096" d="M12.452,4.516c0.446,0.436,0.481,1.043,0,1.576L8.705,10l3.747,3.908c0.481,0.533,0.446,1.141,0,1.574  c-0.445,0.436-1.197,0.408-1.615,0c-0.418-0.406-4.502-4.695-4.502-4.695C6.112,10.57,6,10.285,6,10s0.112-0.57,0.335-0.789  c0,0,4.084-4.287,4.502-4.695C11.255,4.107,12.007,4.08,12.452,4.516z"/>
          </svg> }
        {withSearch && <svg viewBox="0 0 20 20" onClick={ () => { router.push("/search"); } } className="fill-current h-5 w-5 absolute" style={{right: "10px"}}>
        <path fill="#718096" d="M17.545,15.467l-3.779-3.779c0.57-0.935,0.898-2.035,0.898-3.21c0-3.417-2.961-6.377-6.378-6.377  C4.869,2.1,2.1,4.87,2.1,8.287c0,3.416,2.961,6.377,6.377,6.377c1.137,0,2.2-0.309,3.115-0.844l3.799,3.801  c0.372,0.371,0.975,0.371,1.346,0l0.943-0.943C18.051,16.307,17.916,15.838,17.545,15.467z M4.004,8.287  c0-2.366,1.917-4.283,4.282-4.283c2.366,0,4.474,2.107,4.474,4.474c0,2.365-1.918,4.283-4.283,4.283  C6.111,12.76,4.004,10.652,4.004,8.287z"/>
        </svg>}
        <div className="text-center">
          <span className="text-gray-600 text-sm">
            <i className="em em-grinning"></i>{ title }</span>
        </div>
      </nav>
        { children }
        { active !== TABS.no && <ul className="flex mt-6 fixed bottom-0 w-full border-gray-400 border-t">
          <li className="flex-1">
            <Link href="/">
              <a className={ active === TABS.onsale ? activeClassName : normalClassName }>{t("onSale")}</a>
            </Link>
          </li>
          <li className="flex-1">
            <Link href="/waiting">
              <a className={ active === TABS.waiting ? activeClassName : normalClassName } >{t("comingSoon")}</a>
            </Link>
          </li>
          <li className="flex-1">
            <Link href="/my">
              <a className={ active === TABS.myauction ? activeClassName : normalClassName } >{t("my")}</a>
            </Link>
          </li>
        </ul>
      }
      </div>
    </div>
  );
};
