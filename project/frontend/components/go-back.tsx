import React from "react";

const GoBack: React.FC = () => {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-yellow-300 underline hover:text-yellow-500 pb-2 transition duration-300 hover:cursor-pointer"
    >
      Go Back
    </button>
  );
};

export default GoBack;
