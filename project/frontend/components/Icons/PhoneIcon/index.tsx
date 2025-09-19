import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const PhoneIcon = ({className}: EveryIconProps) => {
  return <FontAwesomeIcon icon={faPhone} className={`!text-black text-lg w-6 hover:text-white ${className}`} />;
};
