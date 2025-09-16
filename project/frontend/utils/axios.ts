import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'http://localhost:8082/api/v1',
});

export default axiosInstance;
