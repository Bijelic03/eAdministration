import Button from "../button";
import Pagination from "../pagination";

interface TableProps {
  children: React.ReactNode;
  className?: string;
  hasAddButton?: boolean;
  addButtonLabel?: string;
  addButtonOnClick?: () => void;
  paginationProps?: {
    page: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
  };
}

const Table: React.FC<TableProps> = ({
  children,
  className,
  hasAddButton,
  addButtonLabel,
  addButtonOnClick,
  paginationProps,
}) => {
  return (
    <div className={`w-full mx-auto max-w-[1350px] ${className}`}>
      {hasAddButton && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={addButtonOnClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md"
          >
            {addButtonLabel}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <table className="min-w-full table-auto border-collapse text-white">
          {children}
        </table>
      </div>

      {/* {paginationProps && (
        <div className="mt-4">
          <Pagination
            page={paginationProps.page}
            total={paginationProps.total}
            limit={paginationProps.limit}
            onPageChange={paginationProps.onPageChange}
          />
        </div>
      )} */}
    </div>
  );
};

export default Table;
