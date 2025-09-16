import React, { ChangeEvent } from 'react';
import { formatLabel } from './form-helper';

interface InputProps {
	type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
	id: string;
	name: string;
	value: string | number;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	className?: string;
}

const Input: React.FC<InputProps> = ({
	type = 'text',
	id,
	name,
	value,
	onChange,
	placeholder,
	error,
	required = false,
	className = '',
	...props
}) => {
	return (
		<div className='w-full'>
			<label htmlFor={id}>{formatLabel(name)}</label>
			<input
				type={type}
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				className={`mt-1 w-full h-12 bg-darkGray px-4 transition-all duration-100 border-1 ${
					error ? 'border-2 border-red-500' : ''
				} ${className}`}
				{...props}
			/>
			{error && <p className='text-red-500 text-sm'>{error}</p>}
		</div>
	);
};

export default Input;
