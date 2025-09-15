import Wrap from "@/components/wrap";
import Link from "next/link";

export default function Home() {
  return (
   <div className="p-20">
    <Wrap>
      <h1 className="text-4xl font-bold">Izaberite sistem koji želite</h1>
      <div className="flex flex-col gap-y-4 mt-8">
      <Link className="border-1 p-2 max-w-64 font-bold transition duration-300 hover:text-yellow-300" href={'/fakultet'}>Fakultet</Link>
      <Link className="border-1 p-2 max-w-64 font-bold transition duration-300 hover:text-yellow-300" href={'/sluzba-za-zaposljavanje'}>Sistem za zapošljavanje</Link>
      </div>
    </Wrap>
   </div>
  );
}
