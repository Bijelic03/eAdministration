import Button from '../button';
import Pagination from '../pagination';

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
		<>
			{hasAddButton && (
				<>
					<div className='flex justify-end'>
						<Button onClick={addButtonOnClick}>{addButtonLabel}</Button>
					</div>
				</>
			)}

			<div
				className={`mx-auto max-w-[1350px] w-full border border-white ${className}`}
			>
				<div className='overflow-x-auto'>
					<table className='min-w-full table-auto border-collapse'>
						{children}
					</table>
				</div>
			</div>
{/* 
			{paginationProps && (
				<Pagination
					page={paginationProps.page}
					total={paginationProps.total}
					limit={paginationProps.limit}
					onPageChange={paginationProps.onPageChange}
				/>
			)} */}
		</>
	);
};

export default Table;
