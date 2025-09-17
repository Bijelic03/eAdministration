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
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { handleApiError } from "@/services/api.service";
import { useEffect, useState } from "react";
import UpsertCoursesForm from "./courses.form";
import useCourse from "@/hooks/useCourse";

const KurseviPage = () => {
  const {values, createCourse, deleteCourse, fetchCourses, updateCourse} = useCourse();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();
  const { isOpen, toggleModal } = useModal();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCreate = async (data: any) => {
    try {
      await createCourse(data);
    } catch (error) {
      handleApiError(error, "Kreiranje nije uspjelo");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdit = async (data: any) => {
    try {
      await updateCourse(data);
    } catch (error) {
      handleApiError(error, "Update nije uspio");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteCourse(id);
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <Table
        hasAddButton={true}
        addButtonOnClick={() => toggleModal()}
        addButtonLabel="Dodaj novi kurs"
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
          <TableHeaderCell>Kod</TableHeaderCell>
          <TableHeaderCell>Naziv</TableHeaderCell>
          <TableHeaderCell>ECTS bodovi</TableHeaderCell>
          <TableHeaderCell>Aktivan</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.courses?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.courses?.map((course: any) => (
              <TableRow key={course.id}>
                <TableCell># {course?.id}</TableCell>
                <TableCell>{course?.code}</TableCell>
                <TableCell>{course?.name}</TableCell>
                <TableCell>{course?.ects}</TableCell>
                <TableCell>{course?.active}</TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    onClick={() => {
                      setData(course);
                      toggleModal();
                    }}
                  >
                    <Icon type="edit" />
                  </Button>
                  <Button onClick={() => onDelete(course.id)}>
                    <Icon type="reject" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema kurseva</TableCell>
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
          <ModalLabel label="Apdejtuj kurs" />
        )}
        <UpsertCoursesForm
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

export default KurseviPage;
