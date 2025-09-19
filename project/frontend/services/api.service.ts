import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';

export function handleApiError(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: any,
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
	toast.error(error?.response?.data || message);
}

export function handleApiSuccess(message: string) {
	toast.success(message);
}
