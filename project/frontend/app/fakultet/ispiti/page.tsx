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
import useModal from '@/hooks/useModal';
import usePaginationAndSearch from '@/hooks/usePaginationAndSearch';
import { handleApiError, handleApiSuccess } from '@/services/api.service';
import { useEffect, useState } from 'react';
import UpsertExamsForm from './exams.form';
import useExam from '@/hooks/useExam';

const IspitiPage = () => {
	const {
		values,
		createExam,
		deleteExam,
		fetchExams,
		updateExam,
		onEnterExam,
	} = useExam();
	const { page, rowsPerPage, search, handlePageChange } =
		usePaginationAndSearch();
	const { isOpen, toggleModal } = useModal();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onCreate = async (data: any) => {
		try {
			await createExam(data);
			handleApiSuccess('Kreiranje ispita uspjesno!');
		} catch (error) {
			handleApiError(error, 'Kreiranje nije uspjelo');
		}
	};

	const enterExam = async (id: string) => {
		try {
			await onEnterExam(id);
			handleApiSuccess('Ispit prijavljen uspjesno!');
		} catch (error) {
			handleApiError(error, 'Prijava ispita nije uspjela.');
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onEdit = async (data: any) => {
		try {
			await updateExam(data);
			handleApiSuccess('Ispit apdejtovan uspjesno!');
		} catch (error) {
			handleApiError(error, 'Update nije uspio');
		}
	};

	const onDelete = async (id: string) => {
		try {
			await deleteExam(id);
			handleApiSuccess('Ispit obrisan uspjesno!');
		} catch (error) {
			handleApiError(error, 'Brisanje nije uspjelo.');
		}
	};

	useEffect(() => {
		fetchExams();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage, search]);

	if (values?.loading) return <Loading />;

	return (
		<Wrap>
			<Table
				hasAddButton={true}
				addButtonOnClick={() => toggleModal()}
				addButtonLabel='Dodaj novi ispit'
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
					<TableHeaderCell>Vrijeme</TableHeaderCell>
					<TableHeaderCell>Kurs ID</TableHeaderCell>
					<TableHeaderCell>Profesor ID</TableHeaderCell>
					<TableHeaderCell>Akcije</TableHeaderCell>
				</TableHeader>
				<tbody>
					{values?.exams?.length > 0 ? (
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						values?.exams?.map((exam: any) => (
							<TableRow key={exam.id}>
								<TableCell># {exam?.id}</TableCell>
								<TableCell>{exam?.examtime}</TableCell>
								<TableCell>{exam?.courseid}</TableCell>
								<TableCell>{exam?.professorid}</TableCell>
								<TableCell className='flex gap-4'>
									<Button
										onClick={() =>
											(window.location.href = `/fakultet/ispitne-prijave/${exam?.id}`)
										}
									>
										<Icon type='view' />
									</Button>
									<Button onClick={() => enterExam(exam.id)}>
										<Icon type='interviewSchedule' />
									</Button>
									<Button
										onClick={() => {
											setData(exam);
											toggleModal();
										}}
									>
										<Icon type='edit' />
									</Button>
									<Button onClick={() => onDelete(exam.id)}>
										<Icon type='reject' />
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6}>Nema ispita</TableCell>
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
					<ModalLabel label='Kreiraj ispit' />
				) : (
					<ModalLabel label='Apdejtuj ispit' />
				)}
				<UpsertExamsForm
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

export default IspitiPage;
