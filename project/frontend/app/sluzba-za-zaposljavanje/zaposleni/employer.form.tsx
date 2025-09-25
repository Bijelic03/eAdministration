'use client';
import Button from '@/components/button';
import Input from '@/components/form/input';
import React, { useEffect, useState } from 'react';
import useJob from '@/hooks/useJob';
import Select from '@/components/form/select';
import { getIndexNumbersByOffice } from '@/api/students.api';

interface FormProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onCreate: (data: any) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onEdit: (data: any) => void;
}
const UpsertEmployerForm = ({ data, onCreate, onEdit }: FormProps) => {
	const { values, fetchJobs } = useJob();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formData, setFormData] = useState<any>({
		jobid: data?.jobid || '',
		indexno: data?.indexno || '',
		fullname: data?.fullname || '',
		email: data?.email || '',
		password: '',
		role: 'employee',
	});

	console.log('data', data);

	const [indices, setIndices] = useState<string[]>([]);

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

		if (data?.id) {
			onEdit({ ...formData, indexno: data.indexno, id: data.id });
		} else {
			onCreate(formData);
		}
	};

	useEffect(() => {
		fetchJobs();
	}, []);

	useEffect(() => {
		const fetchIndices = async () => {
			try {
				const data = await getIndexNumbersByOffice();
				setIndices(data);
			} catch (err) {
				console.error('Failed to fetch index numbers', err);
			}
		};

		fetchIndices();

		if (
			data !== undefined &&
			data?.jobid !== undefined &&
			data?.jobid !== null
		) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			setFormData((prev: any) => ({
				...prev,
				jobid: data.jobid,
			}));
		}
	}, []);

	// Pretvaramo values u array objekata { value, label } i dodajemo default opciju
	const JOB_OPTIONS = [
		{ value: '', label: 'Odaberi posao' }, // default opcija
		...(values?.jobs?.map((job: { id: string; title: string }) => ({
			value: job.id,
			label: job.title,
		})) || []),
	];

	return (
		<>
			<form
				onSubmit={handleSubmit}
				className='my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto'
			>
				<div className='grid grid-cols-1 gap-5 w-full'>
					<Select
						id='jobid'
						name='jobid'
						value={formData.jobid}
						onChange={handleChange}
						options={JOB_OPTIONS}
						required
					/>

					{!data?.id ? (
						<>
							<Select
								id='indexno'
								name='indexno'
								value={formData.indexno}
								onChange={handleChange}
								options={[
									{ value: '', label: 'Izaberi indeks' }, // placeholder
									...(indices
										?.filter((idx) => idx !== '') // izbaci prazne stringove
										.map((idx) => ({ value: idx, label: idx })) || []),
								]}
							/>
						</>
					) : (
						<>
							<Input
								id='indexno'
								name='indexno'
								value={data.indexno}
								onChange={handleChange}
								placeholder=''
								className='border-yellow-500'
								required
							/>
						</>
					)}

					<Input
						id='fullname'
						name='fullname'
						value={formData.fullname}
						onChange={handleChange}
						placeholder='Ime i prezime'
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
						type='password'
						id='password'
						name='password'
						value={formData.password}
						onChange={handleChange}
						placeholder='Password'
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
