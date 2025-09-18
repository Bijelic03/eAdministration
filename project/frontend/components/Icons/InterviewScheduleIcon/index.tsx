import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EveryIconProps } from "..";

export const InterviewScheduleIcon = ({ className }: EveryIconProps) => {
  return (
    <FontAwesomeIcon
      icon={faCalendarCheck}
      className={`!text-white text-lg w-6 hover:text-white ${className}`}
    />
  );
};
