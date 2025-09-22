"use client";

import Loading from "@/components/loading";
import Table from "@/components/table/table";
import TableCell from "@/components/table/tableCell";
import TableHeader from "@/components/table/tableHeader";
import TableHeaderCell from "@/components/table/tableHeaderCell";
import TableRow from "@/components/table/tableRow";
import Wrap from "@/components/wrap";
import useEmployer from "@/hooks/useEmployer";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";
import { useEffect } from "react";

const PosloviPage = () => {
  const { values, fetchEmployers } = useEmployer();
  const { page, rowsPerPage, search, handlePageChange } =
    usePaginationAndSearch();

  useEffect(() => {
    fetchEmployers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  if (values?.loading) return <Loading />;

  return (
    <Wrap>
      <h1 className="text-xl font-bold mb-4">Kolege</h1>
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
          <TableHeaderCell>Ime i prezime</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
        </TableHeader>
        <tbody>
          {values?.employers?.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values?.employers?.map((employer: any) => (
              <TableRow key={employer.id}>
                <TableCell>{employer?.fullname}</TableCell>
                <TableCell>{employer?.email}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>Nema kolega</TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>
    </Wrap>
  );
};

export default PosloviPage;
