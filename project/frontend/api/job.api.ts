import { axiosEmploymentOfficeInstance as axiosInstance } from "@/utils/axios";

const JOB_API_PATH = '/employmentOffice/jobs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createJobAPI(data: any) {
	const response = await axiosInstance.post(JOB_API_PATH, data);
	return response.data;
}

export async function fetchJobsAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${JOB_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchJobByIdAPI(id: string) {
	const response = await axiosInstance.get(`${JOB_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateJobAPI(data: any) {
	const response = await axiosInstance.put(`${JOB_API_PATH}/${data.id}`, data);
	return response.data;
}

export async function deleteJobAPI(id: string) {
	const response = await axiosInstance.delete(`${JOB_API_PATH}/${id}`);
	return response.data;
}

export async function applyForJobAPI(jobId: string, email: string) {
	const response = await axiosInstance.post(`${JOB_API_PATH}/${jobId}/${email}/apply`, { email });
	return response.data;
}