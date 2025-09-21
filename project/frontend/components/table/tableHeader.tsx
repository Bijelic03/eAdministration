import React from "react";

interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-gray-900 text-gray-200">
      <tr>{children}</tr>
    </thead>
  );
};

export default TableHeader;
