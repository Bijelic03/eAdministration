import {
	axiosUniversityInstance as axiosInstance,
	axiosEmploymentOfficeInstance,
} from '@/utils/axios';

const STUDENT_API_PATH = '/university/students';
const EMPLOYMENT_OFFICE = '/employmentOffice/candidates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createStudentAPI(data: any) {
	const response = await axiosInstance.post(STUDENT_API_PATH, data);
	return response.data;
}

export async function fetchStudentsAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${STUDENT_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchStudentByIdAPI(id: string) {
	const response = await axiosInstance.get(`${STUDENT_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateStudentAPI(data: any) {
	const response = await axiosInstance.put(
		`${STUDENT_API_PATH}/${data.id}`,
		data
	);
	return response.data;
}

export async function deleteStudentAPI(id: string) {
	const response = await axiosInstance.delete(`${STUDENT_API_PATH}/${id}`);
	return response.data;
}

export const getIndexNumbers = async (): Promise<string[]> => {
	const response = await axiosInstance.get(
		`${STUDENT_API_PATH}/get/indexno/all`
	);
	return response.data.indices;
};

export const getIndexNumbersByOffice = async (): Promise<string[]> => {
	const response = await axiosEmploymentOfficeInstance.get(
		`${EMPLOYMENT_OFFICE}/get/indexno/all`
	);
	return response.data.indices;
};
