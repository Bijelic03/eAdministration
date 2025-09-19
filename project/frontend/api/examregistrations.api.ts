import { axiosUniversityInstance as axiosInstance } from "@/utils/axios";

const EXAM_REGISTRATIONS_API_PATH = '/university/exams';

export async function fetchExamRegistrationsByIdAPI(id: string) {
	const response = await axiosInstance.get(`${EXAM_REGISTRATIONS_API_PATH}/${id}/examregistrations`);
	return response.data;
}

export async function deleteExamRegistrationsAPI(id: string) {
	const response = await axiosInstance.delete(`${EXAM_REGISTRATIONS_API_PATH}/${id}`);
	return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function gradeStudentAPI(data: any) {
    const {studentid, id, grade} = data;
    const payload = {studentid, grade};
    const response = await axiosInstance.put(`${EXAM_REGISTRATIONS_API_PATH}/${id}/grade`, payload);
	return response.data;
}