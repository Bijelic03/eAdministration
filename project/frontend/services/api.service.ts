import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';

export function handleApiError(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: any,
	fallbackMessage: string = 'Unexpected error',
	skipToaster = false
) {
	console.log(error, "API EROR");
	const message =
		isAxiosError(error) && error.response?.data?.message
			? error.response.data.message
			: error instanceof Error
			? error.message
			: fallbackMessage;

	if (skipToaster) return;
	toast.error(error?.response?.data || message);
}
