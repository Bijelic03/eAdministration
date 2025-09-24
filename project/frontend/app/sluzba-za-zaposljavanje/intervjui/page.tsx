"use client";

import Button from "@/components/button";
import Icon from "@/components/Icons";
import Loading from "@/components/loading";
import Table from "@/components/table/table";
import TableCell from "@/components/table/tableCell";
import TableHeader from "@/components/table/tableHeader";
import TableHeaderCell from "@/components/table/tableHeaderCell";
import TableRow from "@/components/table/tableRow";
import Wrap from "@/components/wrap";
import useJob from "@/hooks/useJob";
import useCandidate from "@/hooks/useCandidate";
import useInterviews from "@/hooks/useInterviews";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { handleApiError, handleApiSuccess } from "@/services/api.service";
import { useEffect, useState } from "react";
import { formatDateTime } from "../../../utils/date";
import { isCandidate, isSSZAdmin } from "@/services/role.service";

const PozicijeOglasiPage = () => {
  const { fetchJobById } = useJob();
  const { fetchCandidateById } = useCandidate();
  const {
    values,
    fetchInterviews,
    deleteIterview,
    acceptInterview,
    zaposli,
    odbij,
  } = useInterviews();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();

  const [interviewDetails, setInterviewDetails] = useState<
    { interview: any; candidate: any; job: any }[]
  >([]);

  const onAccept = async (id: string) => {
    try {
      await acceptInterview(id);
      handleApiSuccess("Intervju prihvacen!");
      // Refetch interviews
      fetchInterviews();
    } catch (error) {
      handleApiError(error, "Prihvatanje nije uspjelo.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteIterview(id);
      handleApiSuccess("Brisanje intervjua uspjesno!");
      // Refetch interviews
      fetchInterviews();
    } catch (error) {
      handleApiError(error, "Brisanje nije uspjelo.");
    }
  };

  const onZaposli = async (candidateid: string, jobid: string) => {
    try {
      await zaposli(candidateid, jobid);
      handleApiSuccess("Kandidat uspjesno zaposlen!");
      // Refetch interviews
      fetchInterviews();
    } catch (error) {
      handleApiError(error, "Zaposljavanje nije uspjelo.");
    }
  };

  const onOdbij = async (id: string) => {
    try {
      await odbij(id);
      handleApiSuccess("Kandidat uspjesno odbijen!");
      // Refetch interviews
      fetchInterviews();
    } catch (error) {
      handleApiError(error, "Odbijanje nije uspjelo.");
    }
  };

  useEffect(() => {
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  // Fetch candidate and job details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!values?.interviews) return;

      const details = await Promise.all(
        values.interviews.map(async (interview: any) => {
          const candidate = await fetchCandidateById(interview.candidateid);
          const job = await fetchJobById(interview.jobid);
          return { interview, candidate, job };
        })
      );

      setInterviewDetails(details);
    };

    fetchDetails();
  }, [values?.interviews]);

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
          <TableHeaderCell>Posao</TableHeaderCell>
          <TableHeaderCell>Kandidat</TableHeaderCell>
          {/* <TableHeaderCell>Vrijeme</TableHeaderCell> */}
          <TableHeaderCell>Mjesto</TableHeaderCell>
          <TableHeaderCell>Akcije</TableHeaderCell>
        </TableHeader>
        <tbody>
          {interviewDetails.length > 0 ? (
            interviewDetails.map(({ interview, candidate, job }) => (
              <TableRow key={interview.id}>
                <TableCell>{job?.title || interview.jobid}</TableCell>
                <TableCell>
                  {candidate?.fullname || interview.candidateid}
                </TableCell>
                {/* <TableCell>{interview.datetime}</TableCell> */}
                <TableCell>{interview.location}</TableCell>
                <TableCell className="flex gap-4">
                  {interview?.accepted !== true ? (
                    <>
                      {isCandidate() && (
                        <>
                          <Button
                            tooltip="Prihvati intervju"
                            onClick={() => onAccept(interview.id)}
                          >
                            <Icon type="accept" />
                          </Button>
                        </>
                      )}

                      {(isCandidate() || isSSZAdmin()) && (
                        <>
                          <Button
                            tooltip="Otkazi intervju"
                            onClick={() => onDelete(interview.id)}
                          >
                            <Icon type="reject" />
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {isSSZAdmin() && (
                        <>
                          <Button
                            tooltip="Zaposli kandidata"
                            onClick={() => onZaposli(candidate.id, job.id)}
                          >
                            <Icon type="accept" />
                          </Button>
                          <Button
                            tooltip="Odbij kandidata"
                            onClick={() => onOdbij(candidate.id)}
                          >
                            <Icon type="reject" />
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>Nema intervjua</TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>
    </Wrap>
  );
};

export default PozicijeOglasiPage;
