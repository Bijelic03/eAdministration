import { axiosUniversityInstance as axiosInstance } from "@/utils/axios";

const PROGRAM_API_PATH = "/university/programs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProgramAPI(data: any) {
  const response = await axiosInstance.post(PROGRAM_API_PATH, data);
  return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchProgramsAPI(page = 1, max = 10, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    max: String(max),
    search: search || "",
  });

  const response = await axiosInstance.get(
    `${PROGRAM_API_PATH}?${params.toString()}`
  );

  return response.data;
}

export async function fetchProgramByIdAPI(id: string) {
  const response = await axiosInstance.get(`${PROGRAM_API_PATH}/${id}`);
  return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProgramAPI(data: any) {
  const response = await axiosInstance.put(
    `${PROGRAM_API_PATH}/${data.id}`,
    data
  );
  return response.data;
}

export async function deleteProgramAPI(id: string) {
  const response = await axiosInstance.delete(`${PROGRAM_API_PATH}/${id}`);
  return response.data;
}
