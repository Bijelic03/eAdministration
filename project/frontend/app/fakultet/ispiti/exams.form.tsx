'use client';
import Button from '@/components/button';
import Input from '@/components/form/input';
import Select from '@/components/form/select';
import useCourse from '@/hooks/useCourse';
import useProfessor from '@/hooks/useProfessors';
import React, { useEffect, useState } from 'react';

interface FormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onCreate: (data: any) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onEdit: (data: any) => void;
}

const UpsertExamForm = ({ data, onCreate, onEdit }: FormProps) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<any>({
		examtime: data?.examtime || '',
		courseid: data?.courseid || '',
		professorid: data?.professorid || '',
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

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		let normalizedExamTime = formData.examtime;
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalizedExamTime)) {
			normalizedExamTime = normalizedExamTime + ':00Z';
		}

		const payload = {
			...formData,
			examtime: normalizedExamTime,
			...(data?.id ? { id: data.id } : {}),
		};

		if (data?.id) {
			onEdit(payload);
		} else {
			onCreate(payload);
		}
	};

	const { values: profesorsValues, fetchProfessors } = useProfessor();
	const { values: coursesValues, fetchCourses } = useCourse();

	const PROF_OPTIONS = profesorsValues?.professors.map((prof) => ({
		value: prof.id,
		label: prof.fullname,
	}));

	const COURSES_OPTIONS = coursesValues?.courses.map((course) => ({
		value: course.id,
		label: course.code || course.name,
	}));

	useEffect(() => {
		fetchProfessors();
		fetchCourses();
	}, []);

	return (
		<form
			onSubmit={handleSubmit}
			className='my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto'
		>
			<div className='grid grid-cols-1 gap-5 w-full'>
				<Input
					type='datetime-local'
					id='examtime'
					name='examtime'
					value={formData.examtime}
					onChange={handleChange}
					placeholder='Vreme ispita'
					required
				/>
				<Select
					id='courseid'
					name='courseid'
					value={formData.courseid}
					onChange={handleChange}
					options={COURSES_OPTIONS}
					required
				/>
				<Select
					id='professorid'
					name='professorid'
					value={formData.professorid}
					onChange={handleChange}
					options={PROF_OPTIONS}
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
	);
};

export default UpsertExamForm;
