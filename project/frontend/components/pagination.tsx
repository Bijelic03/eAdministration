'use client'
import React from "react";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  total,
  limit,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex justify-between items-center mt-4">
      <p className="text-sm text-white">
        Page: {page} &mdash; Total items: {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-yellow-300 border rounded disabled:opacity-50 text-black"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 bg-yellow-300 border rounded disabled:opacity-50 text-black"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;