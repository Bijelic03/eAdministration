export const isCandidate = (): boolean => {
	try {
		const stored = localStorage.getItem('auth.user');
		if (!stored) return false;

		const user = JSON.parse(stored);
		return user?.role === 'candidate';
	} catch (error) {
		console.error('Failed to parse auth.user from localStorage:', error);
		return false;
	}
};

export const isEmployee = () => {
	try {
		const stored = localStorage.getItem('auth.user');
		if (!stored) return false;

		const user = JSON.parse(stored);
		return user?.role === 'employee';
	} catch (error) {
		console.error('Failed to parse auth.user from localStorage:', error);
		return false;
	}
};

export const isSSZAdmin = () => {
	try {
		const stored = localStorage.getItem('auth.user');
		if (!stored) return false;

		const user = JSON.parse(stored);
		return user?.role === 'sszadmin';
	} catch (error) {
		console.error('Failed to parse auth.user from localStorage:', error);
		return false;
	}
};

export const isFacultyAdmin = () => {
	try {
		const stored = localStorage.getItem('auth.user');
		if (!stored) return false;

		const user = JSON.parse(stored);
		return user?.role === 'facultyadmin';
	} catch (error) {
		console.error('Failed to parse auth.user from localStorage:', error);
		return false;
	}
};

export const isStudent = () => {
	try {
		const stored = localStorage.getItem('auth.user');
		if (!stored) return false;

		const user = JSON.parse(stored);
		return user?.role === 'student';
	} catch (error) {
		console.error('Failed to parse auth.user from localStorage:', error);
		return false;
	}
};

export const isProfessor = () => {
	try {
		const stored = localStorage.getItem('auth.user');
		if (!stored) return false;

		const user = JSON.parse(stored);
		return user?.role === 'professor';
	} catch (error) {
		console.error('Failed to parse auth.user from localStorage:', error);
		return false;
	}
};
