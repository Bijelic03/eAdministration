"use client";
import Button from "@/components/button";
import Input from "@/components/form/input";
import Select from "@/components/form/select";
import usePrograms from "@/hooks/usePrograms";
import React, { useState, useEffect } from "react";

interface FormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreate: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (data: any) => void;
}

const UpsertStudentForm = ({ data, onCreate, onEdit }: FormProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    indexno: data?.indexno || "",
    fullname: data?.fullname || "",
    email: data?.email || "",
    status: "ACTIVE",
    password: "",
    role: "student",
    singletonid: data?.singletonid || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data?.id) {
      onEdit({ ...formData, indexno: data.indexno, id: data.id });
    } else {
      onCreate(formData);
    }
  };

  // programs
  const { values: programsValues, fetchPrograms } = usePrograms();
  const PROGRAM_OPTIONS =
    programsValues?.programs?.map((prog) => ({
      value: prog.id,
      label: prog.name,
    })) ?? [];

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto"
      >
        <div className="grid grid-cols-1 gap-5 w-full">
          <Input
            id="indexno"
            name="indexno"
            value={formData.indexno}
            onChange={handleChange}
            className={`${data && data?.id && "border-yellow-500"}`}
            placeholder="Indeks NO."
            disabled={data && data?.id ? true : false}
            required
          />
          <Input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Puno ime studenta"
            required
          />
          <Input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@email.com"
            required
          />
          <Select
            id="singletonid"
            name="singletonid"
            value={formData.singletonid}
            onChange={handleChange}
            options={PROGRAM_OPTIONS}
            required
          />
          <Input
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full text-center rounded-[3rem] bg-primary px-6 py-3 mb-3 mt-8 text-white border-1 border-white hover:cursor-pointer transition duration-300 hover:bg-transparent hover:text-yellow-300 hover:border-yellow-300"
        >
          {!data?.id ? "Kreiraj" : "Apdejtuj"}
        </Button>
      </form>
    </>
  );
};

export default UpsertStudentForm;
