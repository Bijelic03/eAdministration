import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    createEmployerAPI,
    deleteEmployerAPI,
    fetchEmployerByIdAPI,
    fetchEmployersAPI,
    updateEmployerAPI,
} from '@/api/employer.api';

export default function useEmployer() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page') || '1';
    const maxParam = searchParams.get('max') || '10';
    const search = searchParams.get('search') || '';

    const [values, setValues] = useState<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        employers: any[];
        page: number;
        totalItems: number;
        totalPages: number;
        loading: boolean;
        error: unknown | null;
    }>({
        employers: [],
        page: 1,
        totalItems: 0,
        totalPages: 0,
        loading: false,
        error: null,
    });
    const fetchEmployers = async (page = pageParam, max = maxParam) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetchEmployersAPI(
                Number(page),
                Number(max),
                search
            );
            setValues((prev) => ({
                ...prev,
                employers: response.data,
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

    const fetchEmployerById = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const emp = await fetchEmployerByIdAPI(id);
            setValues((prev) => ({
                ...prev,
            }));
            return emp;
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
    const createEmployer = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const newEmp = await createEmployerAPI(data);
            setValues((prev) => ({
                ...prev,
                employers: [...prev.employers, newEmp],
            }));
            return newEmp;
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
    const updateEmployer = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const updatedEmp = await updateEmployerAPI(data);
            setValues((prev) => ({
                ...prev,
                employers: prev.employers.map((c) =>
                    c.id === updatedEmp.id ? updatedEmp : c
                ),
            }));
            return updatedEmp;
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

    const deleteEmployer = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            await deleteEmployerAPI(id);
            await fetchEmployers();
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
        fetchEmployers,
        fetchEmployerById,
        createEmployer,
        updateEmployer,
        deleteEmployer,
    };
}
