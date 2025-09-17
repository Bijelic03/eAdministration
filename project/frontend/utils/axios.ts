import axios from 'axios';

export const axiosEmploymentOfficeInstance = axios.create({
	baseURL: 'http://localhost:8082/api/v1',
});

export const axiosUniversityInstance = axios.create({
	baseURL: 'http://localhost:8081/api/v1',
});