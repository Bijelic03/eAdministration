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
import useCandidate from '@/hooks/useCandidate';
import useModal from '@/hooks/useModal';
import usePaginationAndSearch from '@/hooks/usePaginationAndSearch';
import { handleApiError } from '@/services/api.service';
import { useEffect, useState } from 'react';
import UpsertCandidateForm from './candidate.form';

const DUMMY_ARRAY = [
	{
		id: 1,
		fullName: 'Andrej Stj',
		email: 'andrej@gmail.com',
	},
];

const KandidatiPage = () => {
	const {
		values,
		fetchCandidates,
		deleteCandidate,
		updateCandidate,
		createCandidate,
	} = useCandidate();
	const { page, rowsPerPage, search, handlePageChange } =
		usePaginationAndSearch();
	const { isOpen, toggleModal } = useModal();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onCreate = async (data: any) => {
		try {
			await createCandidate(data);
		} catch (error) {
			handleApiError(error, 'Kreiranje nije uspjelo');
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onEdit = async (data: any) => {
		try {
			await updateCandidate(data);
		} catch (error) {
			handleApiError(error, 'Update nije uspio');
		}
	};

	const onDelete = async (id: string) => {
		try {
			await deleteCandidate(id);
		} catch (error) {
			handleApiError(error, 'Brisanje nije uspjelo.');
		}
	};

	useEffect(() => {
		fetchCandidates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage, search]);

	if (values?.loading) return <Loading />;

	return (
		<Wrap>
			<Table
				hasAddButton={true}
				addButtonOnClick={() => toggleModal()}
				addButtonLabel='Dodaj novog kandidata'
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
					<TableHeaderCell>Ime i prezime</TableHeaderCell>
					<TableHeaderCell>Email</TableHeaderCell>
					<TableHeaderCell>Student ID</TableHeaderCell>
					<TableHeaderCell>Akcije</TableHeaderCell>
				</TableHeader>
				<tbody>
					{/* {values?.candidates?.length > 0 ? ( */}
					{DUMMY_ARRAY?.length > 0 ? (
						// values?.candidates?.map((candidate: any) => (
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						DUMMY_ARRAY?.map((candidate: any) => (
							<TableRow key={candidate.id}>
								<TableCell># {candidate?.id}</TableCell>
								<TableCell>{candidate?.fullName}</TableCell>
								<TableCell>{candidate?.email}</TableCell>
								<TableCell>{candidate?.studentId || 'NO STUDENT'}</TableCell>
								<TableCell className='flex gap-4'>
									<Button
										onClick={() => {
											setData(candidate);
											toggleModal();
										}}
									>
										<Icon type='edit' />
									</Button>
									<Button onClick={() => onDelete(candidate.id)}>
										<Icon type='reject' />
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6}>Nema kandidata</TableCell>
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
					<ModalLabel label='Kreiraj kandidata' />
				) : (
					<ModalLabel label='Apdejtuj kandidata' />
				)}
				<UpsertCandidateForm
					data={data}
					onCreate={() => {
						onCreate(data);
						toggleModal();
					}}
					onEdit={() => {
						onEdit(data);
						toggleModal();
					}}
				/>
			</FullScreenModal>
		</Wrap>
	);
};

export default KandidatiPage;
