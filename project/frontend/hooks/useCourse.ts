import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createCourseAPI,
  deleteCourseAPI,
  fetchCourseByIdAPI,
  fetchCoursesAPI,
  updateCourseAPI,
  joinCourseAPI
} from "@/api/courses.api";

export default function useCourse() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const maxParam = searchParams.get("max") || "10";
  const search = searchParams.get("search") || "";

  const [values, setValues] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    courses: any[];
    page: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: unknown | null;
  }>({
    courses: [],
    page: 1,
    totalItems: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });
  const fetchCourses = async (page = pageParam, max = maxParam) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchCoursesAPI(Number(page), Number(max), search);
      setValues((prev) => ({
        ...prev,
        courses: response.courses,
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

  const fetchCourseById = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const course = await fetchCourseByIdAPI(id);
      setValues((prev) => ({
        ...prev,
      }));
      return course;
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
  const createCourse = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const newCourse = await createCourseAPI(data);
      setValues((prev) => ({
        ...prev,
        courses: [...prev.courses, newCourse],
      }));
      return newCourse;
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
  const updateCourse = async (data: any) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedCourse = await updateCourseAPI(data);
      setValues((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === updatedCourse.id ? updatedCourse : c
        ),
      }));
      return updatedCourse;
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

  const deleteCourse = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteCourseAPI(id);
      await fetchCourses();
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
  const joinCourse = async (id: string) => {
    setValues((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await joinCourseAPI(id);
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
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    joinCourse
  };
}
