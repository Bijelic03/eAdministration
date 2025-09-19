"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Wrap from "@/components/wrap";
import Table from "@/components/table/table";
import TableHeader from "@/components/table/tableHeader";
import TableHeaderCell from "@/components/table/tableHeaderCell";
import TableRow from "@/components/table/tableRow";
import TableCell from "@/components/table/tableCell";
import Loading from "@/components/loading";
import useJob from "@/hooks/useJob";

const KandidatiZaPosaoPage = () => {
  const params = useParams();
  const jobId = params?.id as string;

  const { values, fetchCandidatesForJob } = useJob();
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    if (jobId) {
      fetchCandidatesForJob(jobId).then((res) => {
        setCandidates(res);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (values.loading) return <Loading />;

  return (
    <Wrap>
      <h1 className="text-xl font-bold mb-4">Rang lista kandidata</h1>
      <Table className="mt-4">
        <TableHeader>
          <TableHeaderCell>#</TableHeaderCell>
          <TableHeaderCell>Ime i prezime</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Index</TableHeaderCell>
          <TableHeaderCell>Prosecna ocena</TableHeaderCell>
        </TableHeader>
        <tbody>
          {candidates?.length > 0 ? (
            candidates.map((cand, i) => (
              <TableRow key={cand.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{cand.fullname}</TableCell>
                <TableCell>{cand.email}</TableCell>
                <TableCell>{cand.indexno ?? "-"}</TableCell>
                <TableCell>{cand.avggrade ?? "-"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>Nema kandidata za ovaj posao</TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>
    </Wrap>
  );
};

export default KandidatiZaPosaoPage;
