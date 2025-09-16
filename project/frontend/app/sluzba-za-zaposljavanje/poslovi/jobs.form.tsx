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
const UpsertJobForm = ({ data, onCreate, onEdit }: FormProps) => {
	// ID                uuid.UUID  `json:"id"                db:"id"`
	// EmployerID        uuid.UUID  `json:"employerId"        db:"employer_id"`         // FK -> employers.id
	// Title             string     `json:"title"             db:"title"`
	// Description       string     `json:"description"       db:"description"`
	// Location          string     `json:"location"          db:"location"`
	// RequiredFacultyID *uuid.UUID `json:"requiredFacultyId" db:"required_faculty_id"` // “traženi fakultet” iz dijagrama (opciono)
	// CreatedAt         time.Time  `json:"createdAt"         db:"created_at"`
	// UpdatedAt         time.Time  `json:"updatedAt"         db:"updated_at"`

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<any>({
		id: data?.id || '',
		employerId: data?.employerId || '',
		title: data?.title || '',
		description: data?.description || '',
		location: data?.location || '',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
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
						id='employerId'
						name='employerId'
						value={formData.employerId}
						onChange={handleChange}
						placeholder='Employer ID'
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
