'use client';
import Button from '@/components/button';
import Input from '@/components/form/input';
import Select from '@/components/form/select';
import React, { useState } from 'react';

interface FormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	onCreate: () => void;
	onEdit: () => void;
}
const UpsertStudentForm = ({ data, onCreate, onEdit }: FormProps) => {
	// type StudentStatus string

	// const (
	//     StudentActive     StudentStatus = "ACTIVE"
	//     StudentGraduated  StudentStatus = "GRADUATED"
	//     StudentSuspended  StudentStatus = "SUSPENDED" // dodaj/izbaci po potrebi
	// )

	// type Student struct {
	//     ID        uuid.UUID     `json:"id"         db:"id"`          // uuid
	//     IndexNo   string        `json:"indexNo"    db:"index_no"`
	//     Name      string        `json:"name"       db:"name"`
	//     Email     string        `json:"email"      db:"email"`
	//     Status    StudentStatus `json:"status"     db:"status"`
	//     CreatedAt time.Time     `json:"createdAt"  db:"created_at"`
	//     UpdatedAt time.Time     `json:"updatedAt"  db:"updated_at"`

	//     // relations
	//     EducationRecords []EducationRecord `json:"educationRecords" db:"-"`
	//     Enrollments      []Enrollment      `json:"enrollments"      db:"-"`
	// }

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<any>({
		id: data?.id || '',
		indexNo: data?.indexNo || '',
		name: data?.name || '',
		email: data?.email || '',
		status: data?.status || '',
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
						id='indexNo'
						name='indexNo'
						value={formData.indexNo}
						onChange={handleChange}
						placeholder='Indeks NO.'
						required
					/>
					<Input
						type='text'
						id='name'
						name='name'
						value={formData.name}
						onChange={handleChange}
						placeholder='Puno ime studenta'
						required
					/>
					<Input
						id='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						placeholder='email@email.com'
						required
					/>
					<Select
						id='status'
						name='status'
						value={formData.status}
						onChange={handleChange}
						options={[
							{ value: 'ACTIVE', label: 'ACTIVE' },
							{ value: 'GRADUATED', label: 'GRADUATED' },
							{ value: 'SUSPENDED', label: 'SUSPENDED' },
						]}
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

export default UpsertStudentForm;
