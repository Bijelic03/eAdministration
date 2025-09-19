import { axiosUniversityInstance as axiosInstance } from "@/utils/axios";

const EXAM_API_PATH = '/university/exams';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createExamAPI(data: any) {
	const response = await axiosInstance.post(EXAM_API_PATH, data);
	return response.data;
}

export async function fetchExamsAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${EXAM_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchExamByIdAPI(id: string) {
	const response = await axiosInstance.get(`${EXAM_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateExamAPI(data: any) {
	const response = await axiosInstance.put(`${EXAM_API_PATH}/${data.id}`, data);
	return response.data;
}

export async function deleteExamAPI(id: string) {
	const response = await axiosInstance.delete(`${EXAM_API_PATH}/${id}`);
	return response.data;
}

export async function onEnterExamAPI(id: string) {
	const response = await axiosInstance.post(`${EXAM_API_PATH}/${id}/register`)
	return response.data;
}