import Wrap from "@/components/wrap";

export default function NotAuthorizedPage() {
  return (
    <Wrap>
      <div className="flex flex-col items-center justify-center ">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          403 - Not Authorized
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Nemate dozvolu da pristupite ovoj stranici.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Nazad na početnu
        </a>
      </div>
    </Wrap>
  );
}
