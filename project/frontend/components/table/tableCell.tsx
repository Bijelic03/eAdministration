import React from "react";

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  colSpan,
}) => {
  return (
    <td
      colSpan={colSpan}
      className={`py-2 px-4 border-b border-gray-700 text-white ${
        className ?? ""
      }`}
    >
      {children}
    </td>
  );
};

export default TableCell;
