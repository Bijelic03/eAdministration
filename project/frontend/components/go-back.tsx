import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const GoBack: React.FC = () => {
  return (
    <button
      onClick={() => window.history.back()}
      className="hover:cursor-pointer mb-3 flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition duration-300 transform hover:-translate-y-0.5"
    >
      <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
      <span>IDI NAZAD</span>
    </button>
  );
};

export default GoBack;
