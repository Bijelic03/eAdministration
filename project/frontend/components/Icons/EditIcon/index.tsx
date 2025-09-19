import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const EditIcon = ({className}: EveryIconProps) => {
  return (
    <FontAwesomeIcon icon={faPen} className={`text-blue-500 text-xl ${className}`} />
  );
};
