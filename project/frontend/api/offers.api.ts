import { axiosEmploymentOfficeInstance as axiosInstance } from "@/utils/axios";

const OFFERS_API_PATH = '/employmentOffice/jobapplications';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createOfferAPI(data: any) {
	const response = await axiosInstance.post(OFFERS_API_PATH, data);
	return response.data;
}

export async function fetchOffersAPI(page = 1, max = 10, search = '') {
	const params = new URLSearchParams({
		page: String(page),
		max: String(max),
		search: search || '',
	});

	const response = await axiosInstance.get(
		`${OFFERS_API_PATH}?${params.toString()}`
	);

	return response.data;
}

export async function fetchOfferByIdAPI(id: string) {
	const response = await axiosInstance.get(`${OFFERS_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateOfferAPI(data: any) {
	const response = await axiosInstance.put(`${OFFERS_API_PATH}/${data.id}`, data);
	return response.data;
}

export async function deleteOfferAPI(id: string) {
	const response = await axiosInstance.delete(`${OFFERS_API_PATH}/${id}`);
	return response.data;
}

