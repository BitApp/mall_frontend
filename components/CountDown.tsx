import Countdown from "react-countdown";
import {useTranslation} from "../i18n";

// Random component
const Completionist = ({endText}) => <span className="text-gray-500">{endText}</span>;
let globalEndText = "Over";
// Renderer callback with condition
const renderer = ({days, hours, minutes, seconds, completed, t}) => {
  if (completed) {
    // Render a completed state
    return <Completionist endText={globalEndText}/>;
  } else {
    const countDownContent = <span>
      {days} {t("day")} {hours} {t("hour")} {minutes} {t("minute")} {seconds} {t("second")}
    </span>;
    // Render a countdown clientside only
    if (days <= 0 && hours <= 0) {
      return <span className="text-green-500">{countDownContent}</span>;
    } else if (days <= 0 && hours <= 1 && hours > 0) {
      return <span className="text-yellow-500">{countDownContent}</span>;
    } else if (days <= 0 && hours > 1) {
      return <span className="text-blue-500">{countDownContent}</span>;
    } else {
      return <span className="text-gray-500">{countDownContent}</span>;
    }
  }
};
const CountDown = ({endTime, endText}) => {
  const {t} = useTranslation("common");
  if (endText) { globalEndText = endText; }
  return (
    <Countdown
      date={endTime}
      renderer={(context) => renderer(Object.assign({t}, context))}
    />);
};
export default CountDown;
