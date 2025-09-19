'use client';
import Button from '@/components/button';
import Input from '@/components/form/input';
import Select from '@/components/form/select';
import useEmployer from '@/hooks/useEmployer';
import useJob from '@/hooks/useJob';
import React, { useEffect, useState } from 'react';

interface FormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onCreate: (data: any) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onEdit: (data: any) => void;
}
const UpsertJobForm = ({ data, onCreate, onEdit }: FormProps) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<any>({
		employerid: data?.employerid || '',
		title: data?.title || '',
		description: data?.description || '',
		location: data?.location || '',
		requiredfaculty: data?.requiredfaculty || false,
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, type, value, checked } = e.target as HTMLInputElement;

		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (data?.id) {
			onEdit({ ...formData, id: data.id });
		} else {
			onCreate(formData);
		}
	};

	const { values, fetchEmployers } = useEmployer();

	const OPTIONS = values?.employers.map((emp) => ({
		value: emp.id,
		label: emp.fullname,
	}));

	useEffect(() => {
		fetchEmployers();
	}, []);

	return (
		<>
			<form
				onSubmit={handleSubmit}
				className='my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto'
			>
				<div className='grid grid-cols-1 gap-5 w-full'>
					<Select
						id='employerid'
						name='employerid'
						value={formData.employerid}
						onChange={handleChange}
						options={OPTIONS}
						required
					/>
					<Input
						type='text'
						id='title'
						name='title'
						value={formData.title}
						onChange={handleChange}
						placeholder='Title'
						required
					/>
					<Input
						id='description'
						name='description'
						value={formData.description}
						onChange={handleChange}
						placeholder='Description'
						required
					/>
					<Input
						id='location'
						name='location'
						value={formData.location}
						onChange={handleChange}
						placeholder='Location'
						required
					/>
					<Input
						id='requiredfaculty'
						name='requiredfaculty'
						value={formData.requiredfaculty}
						onChange={handleChange}
						type='checkbox'
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

export default UpsertJobForm;
