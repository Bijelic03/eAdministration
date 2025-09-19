"use client";

import Loading from "@/components/loading";
import Table from "@/components/table/table";
import TableCell from "@/components/table/tableCell";
import TableHeader from "@/components/table/tableHeader";
import TableHeaderCell from "@/components/table/tableHeaderCell";
import TableRow from "@/components/table/tableRow";
import Wrap from "@/components/wrap";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import useProfessor from "@/hooks/useProfessors";
import { useEffect } from "react";

const ZaposleniProfesoriSaFaksa = () => {
  const { values, fetchProfessorsFromOtherService } = useProfessor();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();

  useEffect(() => {
    fetchProfessorsFromOtherService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
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
          <TableHeaderCell>Ime i prezime</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.professors?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.professors?.map((professor: any) => (
              <TableRow key={professor.id}>
                <TableCell>{professor?.id}</TableCell>
                <TableCell>{professor?.fullname}</TableCell>
                <TableCell>{professor?.email}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema profesora</TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>
    </Wrap>
  );
};

export default ZaposleniProfesoriSaFaksa;
