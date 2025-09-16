import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'https://tvoj-api-url.com',
});

export default axiosInstance;
