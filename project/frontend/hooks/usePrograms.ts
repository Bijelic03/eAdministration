import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createProgramAPI,
  deleteProgramAPI,
  fetchProgramByIdAPI,
  fetchProgramsAPI,
  updateProgramAPI,
} from "@/api/programs.api";

export default function usePrograms() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const maxParam = searchParams.get("max") || "10";
  const search = searchParams.get("search") || "";

  const [values, setValues] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    programs: any[];
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: unknown | null;
  }>({
    programs: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const fetchPrograms = async (page = pageParam, max = maxParam) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchProgramsAPI(
        Number(page),
        Number(max),
        search
      );
      setValues((prev) => ({
        ...prev,
        programs: response.programs,
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

  const fetchProgramById = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const program = await fetchProgramByIdAPI(id);
      return program;
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
  const createProgram = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const newProgram = await createProgramAPI(data);
      setValues((prev) => ({
        ...prev,
        programs: [...prev.programs, newProgram],
      }));
      return newProgram;
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
  const updateProgram = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedProgram = await updateProgramAPI(data);
      setValues((prev) => ({
        ...prev,
        programs: prev.programs.map((p) =>
          p.id === updatedProgram.id ? updatedProgram : p
        ),
      }));
      return updatedProgram;
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

  const deleteProgram = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteProgramAPI(id);
      await fetchPrograms();
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
    fetchPrograms,
    fetchProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
  };
}
