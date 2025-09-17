import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    createProfessorAPI,
    deleteProfessorAPI,
    fetchProfessorByIdAPI,
    fetchProfessorsAPI,
    updateProfessorAPI,
} from '@/api/professors.api';

export default function useProfessor() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page') || '1';
    const maxParam = searchParams.get('max') || '10';
    const search = searchParams.get('search') || '';

    const [values, setValues] = useState<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        professors: any[];
        page: number;
        totalItems: number;
        totalPages: number;
        loading: boolean;
        error: unknown | null;
    }>({
        professors: [],
        page: 1,
        totalItems: 0,
        totalPages: 0,
        loading: false,
        error: null,
    });
    const fetchProfessors = async (page = pageParam, max = maxParam) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetchProfessorsAPI(
                Number(page),
                Number(max),
                search
            );
            setValues((prev) => ({
                ...prev,
                professors: response.professors,
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

    const fetchProfessorById = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const professor = await fetchProfessorByIdAPI(id);
            setValues((prev) => ({
                ...prev,
            }));
            return professor;
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
    const createProfessor = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const newProfeessor = await createProfessorAPI(data);
            setValues((prev) => ({
                ...prev,
                professors: [...prev.professors, newProfeessor],
            }));
            return newProfeessor;
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
    const updateProfessor = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const updatedProf = await updateProfessorAPI(data);
            setValues((prev) => ({
                ...prev,
                professors: prev.professors.map((pro) =>
                    pro.id === updatedProf.id ? updatedProf : pro
                ),
            }));
            return updatedProf;
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

    const deleteProfessor = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            await deleteProfessorAPI(id);
            await fetchProfessors();
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
        fetchProfessors,
        fetchProfessorById,
        createProfessor,
        updateProfessor,
        deleteProfessor,
    };
}
