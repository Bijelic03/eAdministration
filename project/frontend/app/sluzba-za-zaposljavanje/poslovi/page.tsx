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
import useJob from "@/hooks/useJob";
import useLocalStorage, { AuthUser } from "@/hooks/useLocalStorage";
import useModal from "@/hooks/useModal";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { handleApiError } from "@/services/api.service";
import { useEffect, useState } from "react";
import UpsertJobForm from "./jobs.form";
import { useRouter } from "next/navigation";

const PosloviPage = () => {
  const { values, fetchJobs, deleteJob, updateJob, createJob, applyForJob } =
    useJob();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();
  const { isOpen, toggleModal } = useModal();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>();
  const [user] = useLocalStorage<AuthUser | null>("auth.user", null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCreate = async (data: any) => {
    try {
      await createJob(data);
    } catch (error) {
      handleApiError(error, "Kreiranje nije uspjelo");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdit = async (data: any) => {
    try {
      await updateJob(data);
    } catch (error) {
      handleApiError(error, "Update nije uspio");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteJob(id);
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    }
  };

  const onApplyForJob = async (jobId: string) => {
    try {
      if (!jobId || !user?.email) {
        handleApiError(
          "Job ID or user email is missing",
          "Slanje ponude nije uspjelo."
        );
        return;
      }
      await applyForJob(jobId, user?.email);
    } catch (error) {
      handleApiError(error, "Slanje ponude nije uspjelo.");
    }
  };

  const router = useRouter();

  const onViewCandidates = (jobId: string) => {
    router.push(`/sluzba-za-zaposljavanje/poslovi/${jobId}`);
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <Table
        hasAddButton={true}
        addButtonOnClick={() => toggleModal()}
        addButtonLabel="Dodaj novi posao"
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
          <TableHeaderCell>Gazda</TableHeaderCell>
          <TableHeaderCell>Naziv</TableHeaderCell>
          <TableHeaderCell>Opis</TableHeaderCell>
          <TableHeaderCell>Lokacija</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.jobs?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.jobs?.map((job: any) => (
              <TableRow key={job.id}>
                <TableCell># {job?.id}</TableCell>
                <TableCell>{job?.employerid}</TableCell>
                <TableCell>{job?.title}</TableCell>
                <TableCell>{job?.description}</TableCell>
                <TableCell>{job?.location}</TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    onClick={() => {
                      setData(job);
                      toggleModal();
                    }}
                  >
                    <Icon type="edit" />
                  </Button>
                  <Button onClick={() => onDelete(job.id)}>
                    <Icon type="reject" />
                  </Button>

                  {/* Apply for job */}
                  <Button onClick={() => onApplyForJob(job.id)}>
                    <Icon type="upload" />
                  </Button>

                  <Button onClick={() => onViewCandidates(job.id)}>
                    <Icon type="analytics" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema poslova</TableCell>
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
          <ModalLabel label="Kreiraj posao" />
        ) : (
          <ModalLabel label="Apdejtuj posao" />
        )}
        <UpsertJobForm
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
