import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { EveryIconProps } from "..";

export const UploadIcon = ({className}: EveryIconProps) => {
  return (
    <FontAwesomeIcon icon={faCloudUploadAlt} className={`text-gray-400 text-xl ${className}`} />
  );
};
