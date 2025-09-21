import React from "react";

interface TableRowProps {
  children: React.ReactNode;
}

const TableRow: React.FC<TableRowProps> = ({ children }) => {
  return (
    <tr className="bg-gray-800 hover:bg-gray-700 border-b border-gray-700 transition-colors duration-200">
      {children}
    </tr>
  );
};

export default TableRow;
