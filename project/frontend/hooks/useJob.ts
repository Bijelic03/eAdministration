import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  applyForJobAPI,
  createJobAPI,
  deleteJobAPI,
  fetchJobByIdAPI,
  fetchJobsAPI,
  updateJobAPI,
  fetchCandidatesByJobIdAPI,
} from "@/api/job.api";

export default function useJob() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const maxParam = searchParams.get("max") || "10";
  const search = searchParams.get("search") || "";

  const [values, setValues] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobs: any[];
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: unknown | null;
  }>({
    jobs: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });
  const fetchJobs = async (page = pageParam, max = maxParam) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchJobsAPI(Number(page), Number(max), search);
      setValues((prev) => ({
        ...prev,
        jobs: response.jobs,
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

  const fetchJobById = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const job = await fetchJobByIdAPI(id);
      setValues((prev) => ({
        ...prev,
      }));
      return job;
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
  const createJob = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const newJob = await createJobAPI(data);
      setValues((prev) => ({
        ...prev,
        jobs: [...prev.jobs, newJob],
      }));
      return newJob;
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
  const updateJob = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedJob = await updateJobAPI(data);
      setValues((prev) => ({
        ...prev,
        jobs: prev.jobs.map((cand) =>
          cand.id === updatedJob.id ? updatedJob : cand
        ),
      }));
      return updatedJob;
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

  const deleteJob = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteJobAPI(id);
      await fetchJobs();
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

  const applyForJob = async (jobId: string, email: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await applyForJobAPI(jobId, email);
      return response;
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

  const fetchCandidatesForJob = async (jobId: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const candidates = await fetchCandidatesByJobIdAPI(jobId);
      return candidates;
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
    fetchJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    applyForJob,
    fetchCandidatesForJob,
  };
}
