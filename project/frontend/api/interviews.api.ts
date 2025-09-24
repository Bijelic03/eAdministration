import { axiosEmploymentOfficeInstance as axiosInstance } from "@/utils/axios";

const INTERVIEWS_API_PATH = "/employmentOffice/interviews";

export async function scheduleInterviewAPI(data: {
  jobapplicationid: string;
  candidateid: string;
  jobid: string;
  datetime: string;
  type: string;
  location: string;
}) {
  const response = await axiosInstance.post(`${INTERVIEWS_API_PATH}`, data);
  return response.data;
}

export async function fetchInterviewsAPI(page = 1, max = 10, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    max: String(max),
    search: search || "",
  });

  const response = await axiosInstance.get(
    `${INTERVIEWS_API_PATH}?${params.toString()}`
  );

  return response.data;
}

export async function deleteInterviewAPI(id: string) {
  const response = await axiosInstance.delete(`${INTERVIEWS_API_PATH}/${id}`);
  return response.data;
}

export async function acceptInterviewAPI(id: string) {
  const response = await axiosInstance.patch(
    `${INTERVIEWS_API_PATH}/${id}`,
    {}
  );
  return response.data;
}

export async function odbijAPI(id: string) {
  const response = await axiosInstance.delete(
    `${INTERVIEWS_API_PATH}/${id}/odbij`
  );
  return response.data;
}

export async function zaposliAPI(id: string, jobid: string) {
  const response = await axiosInstance.patch(
    `${INTERVIEWS_API_PATH}/${id}/zaposli/${jobid}`,
    {}
  );
  return response.data;
}
