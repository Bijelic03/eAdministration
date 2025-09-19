import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const AddressIcon = ({ className }: EveryIconProps) => {
  return (
    <FontAwesomeIcon
      icon={faMapMarkerAlt}
      className={`text-red-500 text-xl ${className}`}
    />
  );
};
