import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export interface AuthUser {
	id: string;
	fullName: string;
	email: string;
	role: string;
  }

// ==============================|| HOOK - USE LOCAL STORAGE ||============================= //

export default function useLocalStorage<T>(
	key: string,
	defaultValue: T
): [T, SetValue<T>] {
	const [value, setValue] = useState<T>(() => {
		if (typeof window === 'undefined') return defaultValue;

		try {
			const storedValue = localStorage.getItem(key);
			return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
		} catch (error) {
			console.warn(`Error parsing localStorage key "${key}":`, error);
			return defaultValue;
		}
	});

	useEffect(() => {
		const listener = (e: StorageEvent) => {
			if (e.storageArea === localStorage && e.key === key) {
				try {
					setValue(e.newValue ? JSON.parse(e.newValue) : defaultValue);
				} catch (error) {
					console.warn(
						`Error parsing updated localStorage key "${key}":`,
						error
					);
				}
			}
		};

		window.addEventListener('storage', listener);
		return () => window.removeEventListener('storage', listener);
	}, [key, defaultValue]);

	const setValueInLocalStorage: SetValue<T> = (newValue) => {
		setValue((currentValue) => {
			const result =
				typeof newValue === 'function'
					? (newValue as (prev: T) => T)(currentValue)
					: newValue;

			try {
				localStorage.setItem(key, JSON.stringify(result));
			} catch (error) {
				console.warn(`Error saving to localStorage key "${key}":`, error);
			}

			return result;
		});
	};

	return [value, setValueInLocalStorage];
}
