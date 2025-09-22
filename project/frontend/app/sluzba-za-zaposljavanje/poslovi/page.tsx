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
import {
  handleApiError,
  handleApiSuccess,
  mockApiLoading,
} from "@/services/api.service";
import { useEffect, useState } from "react";
import UpsertJobForm from "./jobs.form";
import { useRouter } from "next/navigation";
import { _truncate } from "@/utils/typography";

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
      handleApiSuccess("Kreiranje posla uspjesno!");
    } catch (error) {
      handleApiError(error, "Kreiranje nije uspjelo");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdit = async (data: any) => {
    try {
      await updateJob(data);
      handleApiSuccess("Apdejtovanje posla uspjesno!");
    } catch (error) {
      handleApiError(error, "Update nije uspio");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteJob(id);
      handleApiSuccess("Brisanje posla uspjesno!");
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onApplyForJob = async (job: any) => {
    const jobId = job.id;
    if (job.requiredfaculty === true) {
      // mimifikacjia kao da cekamo da se potvrdi ustvari cemo samo stavit set timeout ovde..
      mockApiLoading(
        "Poslali smo zahtjev i ceka se odobrenje za verifikaciju obrazovanja..."
      );
      await new Promise((resolve) => setTimeout(resolve, 7000));
    }
    try {
      if (!jobId || !user?.email) {
        handleApiError(
          "Job ID or user email is missing",
          "Slanje ponude nije uspjelo."
        );
        return;
      }
      await applyForJob(jobId, user?.email);
      handleApiSuccess("Prijava na posao uspjesno poslata!");
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
      <h1 className="text-xl font-bold mb-4">Poslovi</h1>
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
          <TableHeaderCell>Naziv</TableHeaderCell>
          <TableHeaderCell>Opis</TableHeaderCell>
          <TableHeaderCell>Lokacija</TableHeaderCell>
          <TableHeaderCell>Verifikacija faksa</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.jobs?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.jobs?.map((job: any) => (
              <TableRow key={job.id}>
                <TableCell>{job?.title}</TableCell>
                <TableCell>{_truncate(job?.description)}</TableCell>
                <TableCell>{job?.location}</TableCell>
                <TableCell>
                  <span
                    className={`${
                      job?.requiredfaculty === true
                        ? "text-green-500"
                        : "text-red-500"
                    } font-bold`}
                  >
                    {job?.requiredfaculty === true ? "Da" : "Ne"}
                  </span>
                </TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    tooltip="Edituj posao"
                    onClick={() => {
                      setData(job);
                      toggleModal();
                    }}
                  >
                    <Icon type="edit" />
                  </Button>
                  <Button
                    tooltip="Obrisi posao"
                    onClick={() => onDelete(job.id)}
                  >
                    <Icon type="reject" />
                  </Button>

                  {/* Apply for job */}
                  <Button
                    tooltip="Prijavi se na posao"
                    onClick={() => onApplyForJob(job)}
                  >
                    <Icon type="upload" />
                  </Button>

                  <Button
                    tooltip="Pogledaj kandidate"
                    onClick={() => onViewCandidates(job.id)}
                  >
                    <Icon type="view" />
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
