import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
	createCandidateAPI,
	deleteCandidateAPI,
	fetchCandidateByIdAPI,
	fetchCandidatesAPI,
	updateCandidateAPI,
} from '@/api/candidate.api';

export default function useCandidate() {
	const searchParams = useSearchParams();
	const pageParam = searchParams.get('page') || '1';
	const maxParam = searchParams.get('max') || '10';
	const search = searchParams.get('search') || '';

	const [values, setValues] = useState<{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		candidates: any[];
		page: number;
		totalItems: number;
		totalPages: number;
		loading: boolean;
		error: unknown | null;
	}>({
		candidates: [],
		page: 1,
		totalItems: 0,
		totalPages: 0,
		loading: false,
		error: null,
	});
	const fetchCandidates = async (page = pageParam, max = maxParam) => {
		setValues((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const response = await fetchCandidatesAPI(
				Number(page),
				Number(max),
				search
			);
			setValues((prev) => ({
				...prev,
				candidates: response.candidates,
				page: response.page,
				totalItems: response.totalItems,
				totalPages: response.totalPages,
			}));
		} catch (error) {
			setValues((prev) => ({
				...prev,
				error,
			}));
		} finally {
			setValues((prev) => ({ ...prev, loading: false }));
		}
	};

	const fetchCandidateById = async (id: string) => {
		setValues((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const candidate = await fetchCandidateByIdAPI(id);
			setValues((prev) => ({
				...prev,
			}));
			return candidate;
		} catch (error) {
			setValues((prev) => ({
				...prev,
				error,
			}));
		} finally {
			setValues((prev) => ({ ...prev, loading: false }));
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const createCandidate = async (data: any) => {
		setValues((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const newCandidate = await createCandidateAPI(data);
			setValues((prev) => ({
				...prev,
				candidates: [...prev.candidates, newCandidate],
			}));
			return newCandidate;
		} catch (error) {
			setValues((prev) => ({
				...prev,
				error,
			}));
			throw error;
		} finally {
			setValues((prev) => ({ ...prev, loading: false }));
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const updateCandidate = async (data: any) => {
		setValues((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const updatedCandidate = await updateCandidateAPI(data);
			setValues((prev) => ({
				...prev,
				candidates: prev.candidates.map((cand) =>
					cand.id === updatedCandidate.id ? updatedCandidate : cand
				),
			}));
			return updatedCandidate;
		} catch (error) {
			setValues((prev) => ({
				...prev,
				error,
			}));
			throw error;
		} finally {
			setValues((prev) => ({ ...prev, loading: false }));
		}
	};

	const deleteCandidate = async (id: string) => {
		setValues((prev) => ({ ...prev, loading: true, error: null }));
		try {
			await deleteCandidateAPI(id);
			await fetchCandidates();
			setValues((prev) => ({
				...prev,
			}));
		} catch (error) {
			setValues((prev) => ({
				...prev,
				error,
			}));
			throw error;
		} finally {
			setValues((prev) => ({ ...prev, loading: false }));
		}
	};

	return {
		values,
		setValues,
		fetchCandidates,
		fetchCandidateById,
		createCandidate,
		updateCandidate,
		deleteCandidate,
	};
}
