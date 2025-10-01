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
import useProfessor from "@/hooks/useProfessors";
import useModal from "@/hooks/useModal";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { handleApiError, handleApiSuccess } from "@/services/api.service";
import { useEffect, useState } from "react";
import UpsertProfessorForm from "./professors.form";
import { isFacultyAdmin, isProfessor } from "@/services/role.service";

const ProfesoriiPage = () => {
  const {
    values,
    fetchProfessors,
    deleteProfessor,
    updateProfessor,
    createProfessor,
  } = useProfessor();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();
  const { isOpen, toggleModal } = useModal();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCreate = async (data: any) => {
    try {
      await createProfessor(data);
      handleApiSuccess("Kreiranje profesora uspjesno!");
    } catch (error) {
      handleApiError(error, "Kreiranje nije uspjelo");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdit = async (data: any) => {
    try {
      await updateProfessor(data);
      handleApiSuccess("Apdejtovanje profesora uspjesno!");
    } catch (error) {
      handleApiError(error, "Update nije uspio");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteProfessor(id);
      handleApiSuccess("Brisanje profesora uspjesno!");
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    }
  };

  useEffect(() => {
    fetchProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <Table
        hasAddButton={isFacultyAdmin() ? true : false}
        addButtonOnClick={() => toggleModal()}
        addButtonLabel="Dodaj novog profesora"
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
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.professors?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.professors?.map((professor: any) => (
              <TableRow key={professor.id}>
                <TableCell>{professor?.fullname}</TableCell>
                <TableCell>{professor?.email}</TableCell>
                <TableCell className="flex gap-4">
                  {(isProfessor() || isFacultyAdmin()) && (
                    <>
                      <Button
                        tooltip="Edituj"
                        onClick={() => {
                          setData(professor);
                          toggleModal();
                        }}
                      >
                        <Icon type="edit" />
                      </Button>
                      <Button
                        tooltip="Obrisi"
                        onClick={() => onDelete(professor.id)}
                      >
                        <Icon type="reject" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema profesora</TableCell>
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
          <ModalLabel label="Kreiraj profesora" />
        ) : (
          <ModalLabel label="Apdejtuj profesora" />
        )}
        <UpsertProfessorForm
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

export default ProfesoriiPage;
