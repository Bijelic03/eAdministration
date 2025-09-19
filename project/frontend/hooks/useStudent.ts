import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createStudentAPI,
  deleteStudentAPI,
  fetchStudentByIdAPI,
  fetchStudentsAPI,
  updateStudentAPI,
} from "@/api/students.api";

export default function useStudent() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const maxParam = searchParams.get("max") || "10";
  const search = searchParams.get("search") || "";

  const [values, setValues] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    students: any[];
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: unknown | null;
  }>({
    students: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });
  const fetchStudents = async (page = pageParam, max = maxParam) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchStudentsAPI(
        Number(page),
        Number(max),
        search
      );
      setValues((prev) => ({
        ...prev,
        students: response.students,
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

  const fetchStudentById = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const student = await fetchStudentByIdAPI(id);
      setValues((prev) => ({
        ...prev,
      }));
      return student;
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
  const createStudent = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const newStudent = await createStudentAPI(data);
      setValues((prev) => ({
        ...prev,
        students: [...(prev.students || []), newStudent],
      }));
      return newStudent;
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
  const updateStudent = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedStudent = await updateStudentAPI(data);
      setValues((prev) => ({
        ...prev,
        students: prev.students.map((stud) =>
          stud.id === updatedStudent.id ? updatedStudent : stud
        ),
      }));
      return updatedStudent;
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

  const deleteStudent = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteStudentAPI(id);
      await fetchStudents();
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
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}
