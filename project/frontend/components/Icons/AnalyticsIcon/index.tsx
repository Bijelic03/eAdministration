import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const AnalyticsIcon = ({className}: EveryIconProps) => {
  return (
    <FontAwesomeIcon icon={faChartBar} className={`text-green-500 text-xl ${className}`} />
  );
};
