import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  acceptInterviewAPI,
  deleteInterviewAPI,
  fetchInterviewsAPI,
  odbijAPI,
  scheduleInterviewAPI,
  zaposliAPI,
} from "@/api/interviews.api";

export default function useInterviews() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const maxParam = searchParams.get("max") || "10";
  const search = searchParams.get("search") || "";

  const [values, setValues] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interviews: any[];
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: unknown | null;
  }>({
    interviews: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });
  const fetchInterviews = async (page = pageParam, max = maxParam) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchInterviewsAPI(
        Number(page),
        Number(max),
        search
      );
      setValues((prev) => ({
        ...prev,
        interviews: response.interviews,
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

  const deleteIterview = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteInterviewAPI(id);
      await fetchInterviews();
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

  const odbij = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await odbijAPI(id);
      await fetchInterviews();
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

  const zaposli = async (id: string, jobid: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await zaposliAPI(id, jobid);
      await fetchInterviews();
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

  const acceptInterview = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await acceptInterviewAPI(id);
      await fetchInterviews();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scheduleInterview = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await scheduleInterviewAPI(data);
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
    fetchInterviews,
    deleteIterview,
    scheduleInterview,
    acceptInterview,
    odbij,
    zaposli,
  };
}
