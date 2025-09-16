import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    createExamAPI,
    deleteExamAPI,
    fetchExamByIdAPI,
    fetchExamsAPI,
    updateExamAPI,
} from '@/api/exam.api';

export default function useExam() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page') || '1';
    const maxParam = searchParams.get('max') || '10';
    const search = searchParams.get('search') || '';

    const [values, setValues] = useState<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exams: any[];
        page: number;
        totalItems: number;
        totalPages: number;
        loading: boolean;
        error: unknown | null;
    }>({
        exams: [],
        page: 1,
        totalItems: 0,
        totalPages: 0,
        loading: false,
        error: null,
    });
    const fetchExams = async (page = pageParam, max = maxParam) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetchExamsAPI(
                Number(page),
                Number(max),
                search
            );
            setValues((prev) => ({
                ...prev,
                exams: response.data,
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

    const fetchExamById = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const exam = await fetchExamByIdAPI(id);
            setValues((prev) => ({
                ...prev,
            }));
            return exam;
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
    const createExam = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const newExam = await createExamAPI(data);
            setValues((prev) => ({
                ...prev,
                exams: [...prev.exams, newExam],
            }));
            return newExam;
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
    const updateExam = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const updatedExam = await updateExamAPI(data);
            setValues((prev) => ({
                ...prev,
                exams: prev.exams.map((c) =>
                    c.id === updatedExam.id ? updatedExam : c
                ),
            }));
            return updatedExam;
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

    const deleteExam = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            await deleteExamAPI(id);
            await fetchExams();
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
        fetchExams,
        fetchExamById,
        createExam,
        updateExam,
        deleteExam,
    };
}
