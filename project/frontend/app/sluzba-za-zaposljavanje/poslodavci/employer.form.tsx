'use client';
import Button from '@/components/button';
import Input from '@/components/form/input';
import React, { useState } from 'react';

interface FormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	onCreate: () => void;
	onEdit: () => void;
}
const UpsertEmployerForm = ({ data, onCreate, onEdit }: FormProps) => {
/* 
// Employer - poslodavac koji objavljuje ponude
type Employer struct {
	ID   uuid.UUID `json:"id" db:"id"`
	Name string    `json:"name" db:"name"`
	Sector string  `json:"sector" db:"sector"`
}
*/

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<any>({
		id: data?.id || '',
		name: data?.name || '',
        sector: data?.sector || '',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	  ) => {
		const { name, type, value, checked } = e.target as HTMLInputElement;
	  
		setFormData({
		  ...formData,
		  [name]: type === "checkbox" ? checked : value,
		});
	  };
	  

	return (
		<>
			<form
				onSubmit={!data?.id ? onCreate : onEdit}
				className='my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto'
			>
				<div className='grid grid-cols-1 gap-5 w-full'>
					<Input
						id='name'
						name='name'
						value={formData.name}
						onChange={handleChange}
						placeholder='Name'
						required
					/>
					<Input
						type='text'
						id='sector'
						name='sector'
						value={formData.sector}
						onChange={handleChange}
						placeholder='Sector'
						required
					/>
				</div>

				<Button
					type='submit'
					className='w-full text-center rounded-[3rem] bg-primary px-6 py-3 mb-3 mt-8 text-white border-1 border-white hover:cursor-pointer transition duration-300 hover:bg-transparent hover:text-yellow-300 hover:border-yellow-300'
				>
					{!data?.id ? 'Kreiraj' : 'Apdejtuj'}
				</Button>
			</form>
		</>
	);
};

export default UpsertEmployerForm;
