"use client";
import Button from "@/components/button";
import Input from "@/components/form/input";
import React, { useState } from "react";

interface FormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreate: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (data: any) => void;
}
const UpsertEmployerForm = ({ data, onCreate, onEdit }: FormProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    fullname: data?.fullname || "",
    email: data?.email || "",
    password: data?.password || "",
    role: "employee",
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
      onEdit({ ...formData, id: data.id });
    } else {
      onCreate(formData);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto"
      >
        <div className="grid grid-cols-1 gap-5 w-full">
          <Input
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Ime i prezime"
            required
          />
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@email.com"
            required
          />
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
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

export default UpsertEmployerForm;
