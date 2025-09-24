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
import useOffers from "@/hooks/useOffers";
import useModal from "@/hooks/useModal";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { handleApiError, handleApiSuccess } from "@/services/api.service";
import { useEffect, useState } from "react";
import UpsertInterviewsForm from "./interviews.form";
import useInterviews from "@/hooks/useInterviews";
import useJob from "@/hooks/useJob";
import useCandidate from "@/hooks/useCandidate";

const PozicijeOglasiPage = () => {
  const { values, fetchOffers, deleteOffer } = useOffers();
  const { scheduleInterview } = useInterviews();
  const { fetchJobById } = useJob();
  const { fetchCandidateById } = useCandidate();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();
  const { isOpen, toggleModal } = useModal();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [enrichedApplications, setEnrichedApplications] = useState<any[]>([]);
  const [trigger, setTrigger] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCreate = async (formData: any) => {
    try {
      const payload = {
        jobapplicationid: data?.id,
        jobid: data?.jobid,
        candidateid: data?.candidateid,
        ...formData,
      };
      await scheduleInterview(payload);
      handleApiSuccess("Zakazivanje intervjua uspjesno!");
    } catch (error) {
      handleApiError(error, "Zakazivanje nije uspjelo");
    } finally {
      setTrigger((prev) => !prev);
      // window.location.href = '/sluzba-za-zaposljavanje/prijave-za-posao';
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteOffer(id);
      handleApiSuccess("Brisanje ponude uspjesno!");
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    } finally {
      setTrigger((prev) => !prev);
      // window.location.href = '/sluzba-za-zaposljavanje/prijave-za-posao';
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    const enrichApplications = async () => {
      if (!values.jobapplications || values.jobapplications.length === 0)
        return;

      const enriched = await Promise.all(
        values.jobapplications.map(async (app) => {
          const job = await fetchJobById(app.jobid);
          const candidate = await fetchCandidateById(app.candidateid);
          return {
            ...app,
            jobTitle: job?.title || "Nepoznat posao",
            candidateName: `${candidate?.fullname}` || "Nepoznat kandidat",
          };
        })
      );

      setEnrichedApplications(enriched);
    };

    enrichApplications();
  }, [values.jobapplications, trigger]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <h1 className="text-xl font-bold mb-4">Prijave za posao</h1>
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
          <TableHeaderCell>Posao</TableHeaderCell>
          <TableHeaderCell>Kandidat</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {enrichedApplications?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            enrichedApplications.map((offer: any) => (
              <TableRow key={offer.id}>
                <TableCell>{offer?.jobTitle}</TableCell>
                <TableCell>{offer?.candidateName}</TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    tooltip="Zakazi intervju"
                    onClick={() => {
                      setData(offer);
                      toggleModal();
                    }}
                  >
                    <Icon type="interviewSchedule" />
                  </Button>
                  <Button
                    tooltip="Odbij ponudu"
                    onClick={() => onDelete(offer.id)}
                  >
                    <Icon type="reject" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema prijava na poslove</TableCell>
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
        <ModalLabel label="Zakazi intervju" />
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
      </FullScreenModal>
    </Wrap>
  );
};

export default PozicijeOglasiPage;
