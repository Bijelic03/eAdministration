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
import useModal from "@/hooks/useModal";
import { handleApiError } from "@/services/api.service";
import { useEffect, useState } from "react";
import UpsertExamRegistrationsForm from "../grade.form";
import useExamRegistrations from "@/hooks/useExamRegistrations";

const KurseviPage = () => {
  const {values, fetchExamRegistrationsById, gradeStudent} = useExamRegistrations();
  const { isOpen, toggleModal } = useModal();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>();

  const path = window.location.pathname;
  const parts = path.split("/");
  const id = parts[parts.length - 1];


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdit = async (data: any) => {
    try {
      await gradeStudent(data);
    } catch (error) {
      handleApiError(error, "Kreiranje nije uspjelo");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchExamRegistrationsById(id as string);
      } catch (err) {
        console.error("Error fetching exam registrations:", err);
      }
    };

    fetchData();
  }, [id]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <Table
        className="mt-8"
        paginationProps={{
          page: 1,
          total: values.totalItems,
          limit: 100,
          onPageChange: (newPage) => console.log(newPage),
        }}
      >
        <TableHeader>
          <TableHeaderCell>#</TableHeaderCell>
          <TableHeaderCell>Exam ID</TableHeaderCell>
          <TableHeaderCell>Student ID</TableHeaderCell>
          <TableHeaderCell>Ocjena</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.examregistrations?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.examregistrations?.map((examregistration: any) => (
              <TableRow key={examregistration.id}>
                <TableCell>{examregistration?.id}</TableCell>
                <TableCell>{examregistration?.examid}</TableCell>
                <TableCell>{examregistration?.studentid}</TableCell>
                <TableCell>{examregistration?.grade || "NIJE OCJENJEN"}</TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    onClick={() => {
                      setData(examregistration);
                      toggleModal();
                    }}
                  >
                    <Icon type="edit" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema ispitnih prijava za ovaj ispit</TableCell>
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
          <ModalLabel label="Kreiraj kurs" />
        ) : (
          <ModalLabel label="Ocjeni" />
        )}
        <UpsertExamRegistrationsForm
          data={data}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEdit={(formData: any) => {
            onEdit(formData);
            toggleModal();
          }}
        />
      </FullScreenModal>
    </Wrap>
  );
};

export default KurseviPage;
