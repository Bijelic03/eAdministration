"use client";

import Button from "@/components/button";
import Icon from "@/components/Icons";
import Pagination from "@/components/pagination";
import Table from "@/components/table/table";
import TableCell from "@/components/table/tableCell";
import TableHeader from "@/components/table/tableHeader";
import TableHeaderCell from "@/components/table/tableHeaderCell";
import TableRow from "@/components/table/tableRow";
import Wrap from "@/components/wrap";
import { useState } from "react";

// import Table from "@/components/Shared/Table";
// import TableHeader from "@/components/Shared/TableHeader";
// import TableRow from "@/components/Shared/TableRow";
// import TableCell from "@/components/Shared/TableCell";
// import TableHeaderCell from "@/components/Shared/TableHeaderCell";
// import {
//   deleteCompany,
//   getAllCompanies,
//   getTotalCompaniesNumber,
// } from "@/services/companies";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Company } from "@/types/company";
// import Button from "@/components/Shared/Button";
// import Icon from "@/components/Shared/Icons";
// import { handleApiError } from "@/services/handle-api.service";
// import Pagination from "@/components/Pagination";

const KandidatiPage = () => {
//   const router = useRouter();
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

//   const onViewAnalytics = (id: string) => {
//     router.push(`/companies/analytics/${id}`);
//   };

//   const onEditCompany = (id: string) => {
//     router.push(`/companies/edit/${id}`);
//   };

//   const onDeleteCompany = async (id: string) => {
//     try {
//       await deleteCompany(id);
//       setCompanies((prev) =>
//         prev.filter((company: Company) => company.id !== id)
//       );
//       setTotal((prevTotal) => prevTotal - 1);
//     } catch (error) {
//       handleApiError(error, "Failed to delete company.");
//     }
//   };

//   useEffect(() => {
//     const fetchCompanies = async () => {
//       setLoading(true);
//       try {
//         const data = await getAllCompanies(page, limit);
//         setCompanies(data);
//       } catch (err) {
//         handleApiError(err, "Failed to fetch companies.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCompanies();
//   }, [page, limit]);

//   useEffect(() => {
//     const fetchTotalCompanies = async () => {
//       try {
//         const response = await getTotalCompaniesNumber();
//         setTotal(response.total);
//       } catch (error) {
//         handleApiError(error, "Failed to fetch total companies number.");
//       }
//     };

//     fetchTotalCompanies();
//   }, []);

//   if (loading) return <p>Loading...</p>;

const testFun = () => {
  console.log("test");
}

  return (
    <Wrap>
      <Table hasAddButton={true} addButtonHref="/kandidati/new" addButtonLabel="Dodaj novog kandidata" className="mt-8">
        <TableHeader>
          <TableHeaderCell>Company Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Phone</TableHeaderCell>
          <TableHeaderCell>City</TableHeaderCell>
          <TableHeaderCell>Pib</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <tbody>
          {[{id: '123'}].length > 0 ? (
            [{id: '123'}].map((company: {id: string}) => (
              <TableRow key={company.id}>
                <TableCell>1</TableCell>
                <TableCell>2</TableCell>
                <TableCell>3</TableCell>
                <TableCell>4</TableCell>
                <TableCell>5</TableCell>
                <TableCell className="flex gap-4">
                  <Button onClick={() => testFun}>
                    <Icon type="analytics" />
                  </Button>
                  <Button onClick={() => testFun}>
                    <Icon type="edit" />
                  </Button>
                  <Button onClick={() => testFun}>
                    <Icon type="reject" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>No companies available</TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>
      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />
    </Wrap>
  );
};

export default KandidatiPage;