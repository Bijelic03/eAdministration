"use client";

import Button from "@/components/button";
import Icon from "@/components/Icons";
import Loading from "@/components/loading";
// import FullScreenModal, { ModalLabel } from '@/components/modal';
import Table from "@/components/table/table";
import TableCell from "@/components/table/tableCell";
import TableHeader from "@/components/table/tableHeader";
import TableHeaderCell from "@/components/table/tableHeaderCell";
import TableRow from "@/components/table/tableRow";
import Wrap from "@/components/wrap";
import useOffers from "@/hooks/useOffers";
import useModal from "@/hooks/useModal";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { handleApiError, handleApiSuccess } from "@/services/api.service";
import { useEffect, useState } from "react";
import useInterviews from "@/hooks/useInterviews";
// import UpsertInterviewsForm from './interviews.form';

const PozicijeOglasiPage = () => {
  const { values, fetchInterviews, deleteIterview } = useInterviews();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();
  const { isOpen, toggleModal } = useModal();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>();

  const onDelete = async (id: string) => {
    try {
      await deleteIterview(id);
      handleApiSuccess("Brisanje intervjua uspjesno!");
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    }
  };

  useEffect(() => {
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <h1 className="text-xl font-bold mb-4">Intervjui</h1>
      <Table
        className="mt-8"
        paginationProps={{
          page: page + 1,
          total: values.totalItems,
          limit: rowsPerPage,
          onPageChange: (newPage) => handlePageChange(undefined, newPage),
        }}
      >
        <TableHeader>
          <TableHeaderCell>#</TableHeaderCell>
          <TableHeaderCell>Posao ID</TableHeaderCell>
          <TableHeaderCell>Kandidat ID</TableHeaderCell>
          <TableHeaderCell>Aplikacija ID</TableHeaderCell>
          <TableHeaderCell>Vrijeme</TableHeaderCell>
          <TableHeaderCell>Mjesto</TableHeaderCell>
          <TableHeaderCell>Tip</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.interviews?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.interviews?.map((inteview: any) => (
              <TableRow key={inteview.id}>
                <TableCell>{inteview?.id}</TableCell>
                <TableCell>{inteview?.jobid}</TableCell>
                <TableCell>{inteview?.candidateid}</TableCell>
                <TableCell>{inteview?.jobapplicationid}</TableCell>
                <TableCell>{inteview?.datetime}</TableCell>
                <TableCell>{inteview?.location}</TableCell>
                <TableCell>{inteview?.type}</TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    tooltip="Otkazi intervju"
                    onClick={() => onDelete(inteview.id)}
                  >
                    <Icon type="reject" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema intervjua</TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>

      {/* <FullScreenModal
				key={Math.random()}
				isOpen={isOpen}
				onClose={() => {
					setData(null);
					toggleModal();
				}}
			>
				<ModalLabel label='Zakazi intervju' />
				<UpsertInterviewsForm
					data={data}
					onCreate={(formData) => {
						onCreate(formData);
						toggleModal();
					}}
					// onEdit={(formData) => {
					// 	onEdit(formData);
					// 	toggleModal();
					// }}
				/>
			</FullScreenModal> */}
    </Wrap>
  );
};

export default PozicijeOglasiPage;
