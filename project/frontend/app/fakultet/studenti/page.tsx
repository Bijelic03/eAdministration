'use client';

import Button from '@/components/button';
import Icon from '@/components/Icons';
import Loading from '@/components/loading';
import FullScreenModal, { ModalLabel } from '@/components/modal';
import Table from '@/components/table/table';
import TableCell from '@/components/table/tableCell';
import TableHeader from '@/components/table/tableHeader';
import TableHeaderCell from '@/components/table/tableHeaderCell';
import TableRow from '@/components/table/tableRow';
import Wrap from '@/components/wrap';
import useStudent from '@/hooks/useStudent';
import useModal from '@/hooks/useModal';
import usePaginationAndSearch from '@/hooks/usePaginationAndSearch';
import { handleApiError } from '@/services/api.service';
import { useEffect, useState } from 'react';
import UpsertStudentForm from './students.form';

const StudentiPage = () => {
	const { values, fetchStudents, deleteStudent, updateStudent, createStudent } =
		useStudent();
	const { page, rowsPerPage, search, handlePageChange } =
		usePaginationAndSearch();
	const { isOpen, toggleModal } = useModal();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onCreate = async (data: any) => {
		try {
			await createStudent(data);
		} catch (error) {
			handleApiError(error, 'Kreiranje nije uspjelo');
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onEdit = async (data: any) => {
		try {
			await updateStudent(data);
		} catch (error) {
			handleApiError(error, 'Update nije uspio');
		}
	};

	const onDelete = async (id: string) => {
		try {
			await deleteStudent(id);
		} catch (error) {
			handleApiError(error, 'Brisanje nije uspjelo.');
		}
	};

	useEffect(() => {
		fetchStudents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage, search]);

	if (values?.loading) return <Loading />;

	return (
		<Wrap>
			<Table
				hasAddButton={true}
				addButtonOnClick={() => toggleModal()}
				addButtonLabel='Dodaj novog studenta'
				className='mt-8'
				paginationProps={{
					page: page + 1,
					total: values.totalItems,
					limit: rowsPerPage,
					onPageChange: (newPage) => handlePageChange(undefined, newPage),
				}}
			>
				<TableHeader>
					<TableHeaderCell>#</TableHeaderCell>
					<TableHeaderCell>Broj indeksa</TableHeaderCell>
					<TableHeaderCell>Ime i prezime</TableHeaderCell>
					<TableHeaderCell>Email</TableHeaderCell>
					<TableHeaderCell>Status</TableHeaderCell>
					<TableHeaderCell>Akcije</TableHeaderCell>
				</TableHeader>
				<tbody>
					{values?.students?.length > 0 ? (
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						values?.students?.map((student: any) => (
							<TableRow key={student.id}>
								<TableCell># {student?.id}</TableCell>
								<TableCell>{student?.indexno}</TableCell>
								<TableCell>{student?.name}</TableCell>
								<TableCell>{student?.email}</TableCell>
								<TableCell>{student?.status}</TableCell>
								<TableCell className='flex gap-4'>
									<Button
										onClick={() => {
											setData(student);
											toggleModal();
										}}
									>
										<Icon type='edit' />
									</Button>
									<Button onClick={() => onDelete(student.id)}>
										<Icon type='reject' />
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6}>Nema studenata</TableCell>
						</TableRow>
					)}
				</tbody>
			</Table>

			<FullScreenModal
				key={Math.random()}
				isOpen={isOpen}
				onClose={() => {
					setData(null);
					toggleModal();
				}}
			>
				{!data?.id ? (
					<ModalLabel label='Kreiraj studenta' />
				) : (
					<ModalLabel label='Apdejtuj studenta' />
				)}
				<UpsertStudentForm
					data={data}
					onCreate={(formData) => {
						onCreate(formData);
						toggleModal();
					  }}
					  onEdit={(formData) => {
						onEdit(formData);
						toggleModal();
					  }}
				/>
			</FullScreenModal>
		</Wrap>
	);
};

export default StudentiPage;
