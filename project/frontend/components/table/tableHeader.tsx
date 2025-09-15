import React from 'react';

interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-white text-black">
      <tr>{children}</tr>
    </thead>
  );
};

export default TableHeader;