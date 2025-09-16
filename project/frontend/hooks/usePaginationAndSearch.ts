'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

type QueryParams = {
	page?: number;
	limit?: number;
	search?: string;
};

const usePaginationAndSearch = () => {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const pageParam = parseInt(searchParams.get('page') || '1', 10);
	const limitParam = parseInt(searchParams.get('limit') || '10', 10);
	const searchParam = searchParams.get('search') || '';

	const [page, setPage] = useState<number>(pageParam - 1);
	const [rowsPerPage, setRowsPerPage] = useState<number>(limitParam);
	const [search, setSearch] = useState<string>(searchParam);
	const [debouncedSearch, setDebouncedSearch] = useState<string>(searchParam);

	useEffect(() => {
		setPage(pageParam - 1);
		setRowsPerPage(limitParam);
		setSearch(searchParam);
		setDebouncedSearch(searchParam);
	}, [pageParam, limitParam, searchParam]);

	// Debounce search
	useEffect(() => {
		const handler = setTimeout(() => {
			updateQueryParams({ search: debouncedSearch, page: 1 });
			setPage(0);
		}, 300); // 300ms debounce

		return () => clearTimeout(handler);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch]);

	const updateQueryParams = (params: QueryParams) => {
		const newParams = new URLSearchParams(searchParams.toString());

		Object.entries(params).forEach(([key, value]) => {
			if (value === null || value === undefined || value === '') {
				newParams.delete(key);
			} else {
				newParams.set(key, String(value));
			}
		});

		router.replace(`${pathname}?${newParams.toString()}`);
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		setDebouncedSearch(value);
	};

	const handlePageChange = (_: unknown, newPage: number) => {
		setPage(newPage);
		updateQueryParams({ page: newPage + 1 });
	};

	const handleRowsPerPageChange = (
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	) => {
		const newLimit = parseInt(event.target.value, 10);
		setRowsPerPage(newLimit);
		setPage(0);
		updateQueryParams({ limit: newLimit, page: 1 });
	};

	return {
		page,
		rowsPerPage,
		search,
		setPage,
		setRowsPerPage,
		handleSearchChange,
		handlePageChange,
		handleRowsPerPageChange,
	};
};

export default usePaginationAndSearch;
