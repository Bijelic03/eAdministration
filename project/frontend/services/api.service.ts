import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';

export function handleApiError(
	error: unknown,
	fallbackMessage: string = 'Unexpected error',
	skipToaster = false
) {
	const message =
		isAxiosError(error) && error.response?.data?.message
			? error.response.data.message
			: error instanceof Error
			? error.message
			: fallbackMessage;

	if (skipToaster) return;
	toast.error(message);
}
