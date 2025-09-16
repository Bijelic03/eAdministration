import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const WebIcon = ({className}: EveryIconProps) => {
  return (
    <FontAwesomeIcon
      icon={faGlobe}
      className={`!text-black text-lg w-6 hover:text-white ${className}`}
    />
  );
};
