import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const RejectIcon = ({className}: EveryIconProps) => {
  return (
    <FontAwesomeIcon icon={faTimesCircle} className={`text-red-500 text-xl ${className}`} />
  );
};
