import React from "react";

interface TableHeaderCellProps {
  children: React.ReactNode;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children }) => {
  return <th className="py-3 px-4 text-left">{children}</th>;
};

export default TableHeaderCell;
