import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const EyeIcon = ({ className }: EveryIconProps) => {
  return (
    <FontAwesomeIcon
      icon={faEye}
      className={`!text-yellow-400 text-lg w-6 hover:text-white ${className}`}
    />
  );
};
