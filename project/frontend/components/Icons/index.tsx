import React from "react";
import { PhoneIcon } from "./PhoneIcon";
import { EmailIcon } from "./EmailIcon";
import { AcceptIcon } from "./AcceptIcon";
import { EditIcon } from "./EditIcon";
import { InstagramIcon } from "./InstagramIcon";
import { RejectIcon } from "./RejectIcon";
import { WebIcon } from "./WebIcon";
import { UploadIcon } from "./UploadIcon";
import { AddressIcon } from "./AddressIcon";
import { AnalyticsIcon } from "./AnalyticsIcon";

interface IconProps {
  type:
    | "phone"
    | "email"
    | "accept"
    | "edit"
    | "instagram"
    | "reject"
    | "web"
    | "upload"
    | "address"
    | "analytics"
  className?: string;
}

export interface EveryIconProps {
  className?: string;
}

const Icon: React.FC<IconProps> = ({ type, className }) => {
  switch (type) {
    case "phone":
      return <PhoneIcon className={className} />;
    case "email":
      return <EmailIcon className={className} />;
    case "accept":
      return <AcceptIcon className={className} />;
    case "address":
      return <AddressIcon className={className} />;
    case "edit":
      return <EditIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "reject":
      return <RejectIcon className={className} />;
    case "web":
      return <WebIcon className={className} />;
    case "upload":
      return <UploadIcon className={className} />;
    case "analytics":
      return <AnalyticsIcon className={className} />
    default:
      return null;
  }
};

export default Icon;
