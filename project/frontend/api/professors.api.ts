import { axiosUniversityInstance as axiosInstance } from "@/utils/axios";

const PROFESSORS_API_PATH = '/university/professors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProfessorAPI(data: any) {
	const response = await axiosInstance.post(PROFESSORS_API_PATH, data);
	return response.data;
}

export async function fetchProfessorsAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${PROFESSORS_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchProfessorByIdAPI(id: string) {
	const response = await axiosInstance.get(`${PROFESSORS_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProfessorAPI(data: any) {
	const response = await axiosInstance.put(
		`${PROFESSORS_API_PATH}/${data.id}`,
		data
	);
	return response.data;
}

export async function deleteProfessorAPI(id: string) {
	const response = await axiosInstance.delete(`${PROFESSORS_API_PATH}/${id}`);
	return response.data;
}
