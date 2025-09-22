"use client";

import Button from "@/components/button";
import Icon from "@/components/Icons";
import Loading from "@/components/loading";
import FullScreenModal, { ModalLabel } from "@/components/modal";
import Table from "@/components/table/table";
import TableCell from "@/components/table/tableCell";
import TableHeader from "@/components/table/tableHeader";
import TableHeaderCell from "@/components/table/tableHeaderCell";
import TableRow from "@/components/table/tableRow";
import Wrap from "@/components/wrap";
import useCandidate from "@/hooks/useCandidate";
import useModal from "@/hooks/useModal";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { handleApiError, handleApiSuccess } from "@/services/api.service";
import { useEffect, useState } from "react";
import UpsertCandidateForm from "./candidate.form";

// const DUMMY_ARRAY = [
//   {
//     id: 1,
//     fullName: "Andrej Stj",
//     email: "andrej@gmail.com",
//   },
// ];

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
      handleApiSuccess("Kreiranje kandidata uspjesno!");
    } catch (error) {
      handleApiError(error, "Kreiranje nije uspjelo");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdit = async (data: any) => {
    try {
      await updateCandidate(data);
      handleApiSuccess("Apdejtovanje kandidata uspjesno!");
    } catch (error) {
      handleApiError(error, "Update nije uspio");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteCandidate(id);
      handleApiSuccess("Brisanje kandidata uspjesno!");
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <h1 className="text-xl font-bold mb-4">Kandidati</h1>
      <Table
        hasAddButton={true}
        addButtonOnClick={() => toggleModal()}
        addButtonLabel="Dodaj novog kandidata"
        className="mt-8"
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
          <TableHeaderCell>Index</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {/* {values?.candidates?.length > 0 ? ( */}
          {values?.candidates?.length > 0 ? (
            // values?.candidates?.map((candidate: any) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.candidates?.map((candidate: any) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate?.fullname}</TableCell>
                <TableCell>{candidate?.email}</TableCell>
                <TableCell>{candidate?.indexno || "-"}</TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    tooltip="Edit"
                    onClick={() => {
                      setData(candidate);
                      toggleModal();
                    }}
                  >
                    <Icon type="edit" />
                  </Button>
                  <Button
                    tooltip="Obrisi"
                    onClick={() => onDelete(candidate.id)}
                  >
                    <Icon type="reject" />
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
          <ModalLabel label="Kreiraj kandidata" />
        ) : (
          <ModalLabel label="Apdejtuj kandidata" />
        )}
        <UpsertCandidateForm
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

export default KandidatiPage;
