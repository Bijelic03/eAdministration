import React from 'react';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

const TableCell: React.FC<TableCellProps> = ({ children, className, colSpan }) => {
  return (
    <td colSpan={colSpan} className={`py-2 px-4 border border-black ${className ? className : ''}`}>
      {children}
    </td>
  );
};

export default TableCell;