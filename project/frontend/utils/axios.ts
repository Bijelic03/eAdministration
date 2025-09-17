import axios from "axios";

export const axiosEmploymentOfficeInstance = axios.create({
  baseURL: "http://localhost:8082/api/v1",
});

export const axiosUniversityInstance = axios.create({
	baseURL: 'http://localhost:8081/api/v1',
});

axiosEmploymentOfficeInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth.token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
