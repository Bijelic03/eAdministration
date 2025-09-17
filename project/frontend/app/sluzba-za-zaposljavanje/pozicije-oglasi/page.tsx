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
import useOffers from '@/hooks/useOffers';
import useModal from '@/hooks/useModal';
import usePaginationAndSearch from '@/hooks/usePaginationAndSearch';
import { handleApiError } from '@/services/api.service';
import { useEffect, useState } from 'react';
import UpsertOffersForm from './offers.form';

const PozicijeOglasiPage = () => {
	const { values, fetchOffers, deleteOffer, updateOffer, createOffer } = useOffers();
	const { page, rowsPerPage, search, handlePageChange } =
		usePaginationAndSearch();
	const { isOpen, toggleModal } = useModal();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [data, setData] = useState<any>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onCreate = async (data: any) => {
		try {
			await createOffer(data);
		} catch (error) {
			handleApiError(error, 'Kreiranje nije uspjelo');
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onEdit = async (data: any) => {
		try {
			await updateOffer(data);
		} catch (error) {
			handleApiError(error, 'Update nije uspio');
		}
	};

	const onDelete = async (id: string) => {
		try {
			await deleteOffer(id);
		} catch (error) {
			handleApiError(error, 'Brisanje nije uspjelo.');
		}
	};

	useEffect(() => {
		fetchOffers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage, search]);

	if (values?.loading) return <Loading />;

	return (
		<Wrap>
			<Table
				hasAddButton={true}
				addButtonOnClick={() => toggleModal()}
				addButtonLabel='Dodaj novu poziciju/oglas'
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
					<TableHeaderCell>Gazda</TableHeaderCell>
					<TableHeaderCell>Naziv</TableHeaderCell>
					<TableHeaderCell>Opis</TableHeaderCell>
					<TableHeaderCell>Lokacija</TableHeaderCell>
					<TableHeaderCell>Akcije</TableHeaderCell>
				</TableHeader>
				<tbody>
					{values?.offers?.length > 0 ? (
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						values?.offers?.map((job: any) => (
							<TableRow key={job.id}>
								<TableCell># {job?.id}</TableCell>
								<TableCell>{job?.employerId}</TableCell>
								<TableCell>{job?.title}</TableCell>
								<TableCell>{job?.description}</TableCell>
								<TableCell>{job?.location}</TableCell>
								<TableCell className='flex gap-4'>
									<Button
										onClick={() => {
											setData(job);
											toggleModal();
										}}
									>
										<Icon type='edit' />
									</Button>
									<Button onClick={() => onDelete(job.id)}>
										<Icon type='reject' />
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={6}>Nema pozicija/oglasa</TableCell>
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
					<ModalLabel label='Kreiraj poziciju/oglas' />
				) : (
					<ModalLabel label='Apdejtuj poziciju/oglas' />
				)}
				<UpsertOffersForm
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

export default PozicijeOglasiPage;
