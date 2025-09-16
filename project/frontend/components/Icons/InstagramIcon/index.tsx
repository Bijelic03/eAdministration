import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const InstagramIcon = ({className}: EveryIconProps) => {
  return (
    <FontAwesomeIcon icon={faInstagram} className={`!text-black text-lg w-6 ${className}`} />
  );
};
