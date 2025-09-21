/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Loading from "@/components/loading";
import Wrap from "@/components/wrap";
import useProfessor from "@/hooks/useProfessors";
import { useEffect } from "react";
import usePaginationAndSearch from "@/hooks/usePaginationAndSearch";

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
      <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-lg mt-8">
        <h1 className="text-2xl font-semibold mb-6 text-center text-black">
          Profesori sa fakulteta
        </h1>

        {values?.professors?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Ime i prezime
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {values.professors.map((professor: any, idx: number) => (
                  <tr key={professor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {professor.fullname}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {professor.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Nema profesora</p>
        )}

        {/* Pagination */}
        {values.totalItems > rowsPerPage && (
          <div className="flex justify-center mt-6">
            <button
              className="px-4 py-2 bg-black text-white rounded-lg mr-2 disabled:opacity-50"
              onClick={() => handlePageChange(undefined, page - 1)}
              disabled={page <= 0}
            >
              Prethodna
            </button>
            <button
              className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
              onClick={() => handlePageChange(undefined, page + 1)}
              disabled={(page + 1) * rowsPerPage >= values.totalItems}
            >
              Sledeća
            </button>
          </div>
        )}
      </div>
    </Wrap>
  );
};

export default ZaposleniProfesoriSaFaksa;
