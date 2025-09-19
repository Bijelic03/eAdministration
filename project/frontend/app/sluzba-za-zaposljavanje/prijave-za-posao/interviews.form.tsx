"use client";
import Button from "@/components/button";
import Input from "@/components/form/input";
import Select from "@/components/form/select";
import React, { useState } from "react";

interface FormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreate: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // onEdit: (data: any) => void;
}
const UpsertInteviewsForm = ({ data, onCreate }: FormProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    datetime: data?.datetime || "",
    location: data?.location || "",
    type: data?.type || "",
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
    onCreate(formData);
    // if (data?.id) {
    //   onEdit({ ...formData, id: data.id });
    // } else {
    //   onCreate(formData);
    // }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="my-10 flex flex-col gap-y-5 items-center justify-center max-w-[40rem] lg:max-w-[50rem] mx-auto"
      >
        <div className="grid grid-cols-1 gap-5 w-full">
        <Input
            id="datetime"
            name="datetime"
            value={formData.datetime}
            onChange={handleChange}
            placeholder="Vreme i datum"
            required
            type="datetime-local"
          />
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            required
          />
          <Select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={[
              { value: "ONLINE", label: "ONLINE" },
              { value: "IN_PERSON", label: "IN_PERSON" },
            ]}
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

export default UpsertInteviewsForm;
