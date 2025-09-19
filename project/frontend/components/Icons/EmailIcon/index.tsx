import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const EmailIcon = ({ className }: EveryIconProps) => {
  return (
    <FontAwesomeIcon
      icon={faEnvelope}
      className={`!text-black text-lg w-6 hover:text-white ${className}`}
    />
  );
};
