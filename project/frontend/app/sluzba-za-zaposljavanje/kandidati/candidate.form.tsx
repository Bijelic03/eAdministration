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
const UpsertCandidateForm = ({ data, onCreate, onEdit }: FormProps) => {
	// ID        uuid.UUID `json:"id"       db:"id"`
	// StudentID *uuid.UUID`json:"studentId" db:"student_id"` // ako je kandidat student, inače NULL
	// FullName  string    `json:"fullName" db:"full_name"`
	// Email     string    `json:"email"    db:"email"`
	// CreatedAt time.Time `json:"createdAt" db:"created_at"`
	// UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
	// EducationRecords []EducationRecord `json:"educationRecords" db:"-"`
	// Applications     []Application     `json:"applications"     db:"-"`

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<any>({
		id: data?.id || '',
		fullName: data?.fullName || '',
		email: data?.email || '',
		studentId: data?.studentId || '',
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
						id='fullName'
						name='fullName'
						value={formData.fullName}
						onChange={handleChange}
						placeholder='Full name'
						required
					/>
					<Input
						type='email'
						id='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						placeholder='email@email.com'
						required
					/>
					<Input
						id='studentId'
						name='studentId'
						value={formData.studentId}
						onChange={handleChange}
						placeholder='Student ID (can be empty)'
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

export default UpsertCandidateForm;
