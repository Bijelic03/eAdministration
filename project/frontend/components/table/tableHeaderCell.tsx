import React from 'react';

interface TableHeaderCellProps {
  children: React.ReactNode;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children }) => {
  return (
    <th className="py-2 px-4 border text-left">
      {children}
    </th>
  );
};

export default TableHeaderCell;