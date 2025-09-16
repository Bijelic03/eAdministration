import axiosInstance from '@/utils/axios';

const CANDIDATE_API_PATH = '/employmentOffice/candidates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCandidateAPI(data: any) {
	console.log('DATA FROM FORM', data);
	const response = await axiosInstance.post(CANDIDATE_API_PATH, data);
	return response.data;
}

export async function fetchCandidatesAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${CANDIDATE_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchCandidateByIdAPI(id: string) {
	const response = await axiosInstance.get(`${CANDIDATE_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCandidateAPI(data: any) {
	const response = await axiosInstance.put(
		`${CANDIDATE_API_PATH}/${data.id}`,
		data
	);
	return response.data;
}

export async function deleteCandidateAPI(id: string) {
	const response = await axiosInstance.delete(`${CANDIDATE_API_PATH}/${id}`);
	return response.data;
}
