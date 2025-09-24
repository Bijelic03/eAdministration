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
import { handleApiError, handleApiSuccess } from '@/services/api.service';
import { useEffect, useState } from 'react';
import UpsertEmployerForm from './employer.form';
import { isEmployee, isSSZAdmin } from '@/services/role.service';

const PosloviPage = () => {
	const {
		values,
		fetchEmployers,
		deleteEmployer,
		updateEmployer,
		createEmployer,
		fetchEmployerByEmail,
	} = useEmployer();
	const { page, rowsPerPage, search, handlePageChange } =
		usePaginationAndSearch();
	const { isOpen, toggleModal } = useModal();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any>();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onCreate = async (data: any) => {
		try {
			await createEmployer(data);
			handleApiSuccess('Kreiranje zaposlenog uspjesno!');
		} catch (error) {
			handleApiError(error, 'Kreiranje nije uspjelo');
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onEdit = async (data: any) => {
		try {
			await updateEmployer(data);
			handleApiSuccess('Apdejtovanje zaposlenog uspjesno!');
		} catch (error) {
			handleApiError(error, 'Update nije uspio');
		}
	};

	const onDelete = async (id: string) => {
		try {
			await deleteEmployer(id);
			handleApiSuccess('Brisanje zaposlenog uspjesno!');
		} catch (error) {
			handleApiError(error, 'Brisanje nije uspjelo.');
		}
	};

	useEffect(() => {
		if (isEmployee()) {
			fetchEmployerByEmail();
		} else {
			fetchEmployers();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage, search]);

	useEffect(() => {
		if (data?.jobid) {
		}
	}, []);

	if (values?.loading) return <Loading />;

	return (
		<Wrap>
			<h1 className='text-xl font-bold mb-4'>Zaposleni</h1>
			<Table
				hasAddButton={true}
				addButtonOnClick={() => toggleModal()}
				addButtonLabel='Dodaj novog zaposlenog'
				className='mt-8'
				paginationProps={{
					page: page + 1,
					total: values.totalItems,
					limit: rowsPerPage,
					onPageChange: (newPage) => handlePageChange(undefined, newPage),
				}}
			>
				<TableHeader>
					<TableHeaderCell>Ime i prezime</TableHeaderCell>
					<TableHeaderCell>Email</TableHeaderCell>
					<TableHeaderCell>Fakultet?</TableHeaderCell>
					<TableHeaderCell>Akcije</TableHeaderCell>
				</TableHeader>
				<tbody>
					{values?.employers?.length > 0 ? (
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						values?.employers?.map((employer: any) => (
							<TableRow key={employer.id}>
								<TableCell>{employer?.fullname}</TableCell>
								<TableCell>{employer?.email}</TableCell>
								<TableCell>
									{employer?.indexno !== null && employer?.indexno !== ''
										? 'Ima'
										: 'Nema'}
								</TableCell>
								<TableCell className='flex gap-4'>
									{isEmployee() ||
										(isSSZAdmin() && (
											<>
												<Button
													tooltip='Edit'
													onClick={() => {
														setData(employer);
														toggleModal();
													}}
												>
													<Icon type='edit' />
												</Button>
												<Button
													tooltip='Obrisi'
													onClick={() => onDelete(employer.id)}
												>
													<Icon type='reject' />
												</Button>
											</>
										))}
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6}>Nema zaposlenih</TableCell>
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
					<ModalLabel label='Kreiraj zaposlenog' />
				) : (
					<ModalLabel label='Apdejtuj zaposlenog' />
				)}
				<UpsertEmployerForm
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

export default PosloviPage;
