import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const AcceptIcon = ({className}: EveryIconProps) => {
  return (
    <FontAwesomeIcon icon={faCheckCircle} className={`text-green-500 text-xl ${className}`} />
  );
};
