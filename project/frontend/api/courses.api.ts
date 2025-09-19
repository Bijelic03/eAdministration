import { axiosUniversityInstance as axiosInstance } from "@/utils/axios";

const COURSE_API_PATH = '/university/courses';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCourseAPI(data: any) {
	const response = await axiosInstance.post(COURSE_API_PATH, data);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function joinCourseAPI(id: string) {
	const response = await axiosInstance.post(`${COURSE_API_PATH}/${id}/register`);
	return response.data;
}

export async function fetchCoursesAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${COURSE_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchCourseByIdAPI(id: string) {
	const response = await axiosInstance.get(`${COURSE_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCourseAPI(data: any) {
	const response = await axiosInstance.put(`${COURSE_API_PATH}/${data.id}`, data);
	return response.data;
}

export async function deleteCourseAPI(id: string) {
	const response = await axiosInstance.delete(`${COURSE_API_PATH}/${id}`);
	return response.data;
}
