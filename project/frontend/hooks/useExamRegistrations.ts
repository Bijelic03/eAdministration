import { useState } from "react";
import { fetchExamRegistrationsByIdAPI, gradeStudentAPI } from "@/api/examregistrations.api";

export default function useExamRegistrations() {
  const [values, setValues] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    examregistrations: any[];
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: unknown | null;
  }>({
    examregistrations: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });
  const fetchExamRegistrationsById = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchExamRegistrationsByIdAPI(id);
      setValues((prev) => ({
        ...prev,
        examregistrations: response,
        page: 1,
        totalItems: 1,
        totalPages: 1,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gradeStudent = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedExam = await gradeStudentAPI(data);
      setValues((prev) => ({
        ...prev,
        examregistrations: prev.examregistrations.map((c) =>
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

  return {
    values,
    setValues,
    fetchExamRegistrationsById,
    gradeStudent
  };
}
