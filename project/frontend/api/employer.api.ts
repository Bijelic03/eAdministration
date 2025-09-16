import axiosInstance from '@/utils/axios';

const EMPLOYERS_API_PATH = '/employmentOffice/employees';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createEmployerAPI(data: any) {
	const response = await axiosInstance.post(EMPLOYERS_API_PATH, data);
	return response.data;
}

export async function fetchEmployersAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${EMPLOYERS_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchEmployerByIdAPI(id: string) {
	const response = await axiosInstance.get(`${EMPLOYERS_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateEmployerAPI(data: any) {
	const response = await axiosInstance.put(
		`${EMPLOYERS_API_PATH}/${data.id}`,
		data
	);
	return response.data;
}

export async function deleteEmployerAPI(id: string) {
	const response = await axiosInstance.delete(`${EMPLOYERS_API_PATH}/${id}`);
	return response.data;
}
