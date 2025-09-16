import React, { ChangeEvent } from 'react';
import { formatLabel } from './form-helper';

interface TextareaProps {
	id: string;
	name: string;
	value: string;
	onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	className?: string;
	rows?: number;
}

const Textarea: React.FC<TextareaProps> = ({
	id,
	name,
	value,
	onChange,
	placeholder,
	error,
	required = false,
	className = '',
	rows = 6,
}) => {
	return (
		<div>
			<label htmlFor={id}>{formatLabel(name)}</label>
			<textarea
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				rows={rows}
				className={`mt-1 w-full min-h-48 bg-darkGray p-4 transition-all duration-100 border ${
					error ? 'border-2 border-red-500' : ''
				} ${className}`}
			/>
			{error && <p className='text-red-500 text-sm'>{error}</p>}
		</div>
	);
};

export default Textarea;
