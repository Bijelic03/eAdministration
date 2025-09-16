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
import useEmployer from '@/hooks/useEmployer';
import useModal from '@/hooks/useModal';
import usePaginationAndSearch from '@/hooks/usePaginationAndSearch';
import { handleApiError } from '@/services/api.service';
import { useEffect, useState } from 'react';
import UpsertEmployerForm from './employer.form';

const PosloviPage = () => {
	const { values, fetchEmployers, deleteEmployer, updateEmployer, createEmployer } = useEmployer();
	const { page, rowsPerPage, search, handlePageChange } =
		usePaginationAndSearch();
	const { isOpen, toggleModal } = useModal();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onCreate = async (data: any) => {
		try {
			await createEmployer(data);
		} catch (error) {
			handleApiError(error, 'Kreiranje nije uspjelo');
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onEdit = async (data: any) => {
		try {
			await updateEmployer(data);
		} catch (error) {
			handleApiError(error, 'Update nije uspio');
		}
	};

	const onDelete = async (id: string) => {
		try {
			await deleteEmployer(id);
		} catch (error) {
			handleApiError(error, 'Brisanje nije uspjelo.');
		}
	};

	useEffect(() => {
		fetchEmployers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage, search]);

	if (values?.loading) return <Loading />;

	return (
		<Wrap>
			<Table
				hasAddButton={true}
				addButtonOnClick={() => toggleModal()}
				addButtonLabel='Dodaj novog poslodavca'
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
					<TableHeaderCell>Sektor</TableHeaderCell>
				</TableHeader>
				<tbody>
					{values?.employers?.length > 0 ? (
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						values?.employers?.map((employer: any) => (
							<TableRow key={employer.id}>
								<TableCell># {employer?.id}</TableCell>
								<TableCell>{employer?.name}</TableCell>
								<TableCell>{employer?.sector}</TableCell>
								<TableCell className='flex gap-4'>
									<Button
										onClick={() => {
											setData(employer);
											toggleModal();
										}}
									>
										<Icon type='edit' />
									</Button>
									<Button onClick={() => onDelete(employer.id)}>
										<Icon type='reject' />
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6}>Nema poslodavaca</TableCell>
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
					<ModalLabel label='Kreiraj poslodavca' />
				) : (
					<ModalLabel label='Apdejtuj poslodavca' />
				)}
				<UpsertEmployerForm
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

export default PosloviPage;
