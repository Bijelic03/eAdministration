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
const UpsertCoursesForm = ({ data, onCreate, onEdit }: FormProps) => {
  /* 
type Course struct {
	ID     uuid.UUID `json:"id" db:"id"`
	Code   string    `json:"code" db:"code"`
	Name   string    `json:"name" db:"name"`
	Ects   int       `json:"ects" db:"ects"`
	Active bool      `json:"active" db:"active"`
}
}*/

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    code: data?.code || "",
    name: data?.name || "",
    ects: data?.ects || 2,
    active: data?.active || false,
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
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Kod"
            required
          />
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Naziv"
            required
          />
          <Input
            type="number"
            id="ects"
            name="ects"
            value={formData.ects}
            onChange={handleChange}
            placeholder="ECTS bodova"
            required
          />
          <Input
            type="checkbox"
            id="active"
            name="active"
            value={formData.active}
            onChange={handleChange}
            placeholder="Aktivan"
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

export default UpsertCoursesForm;
